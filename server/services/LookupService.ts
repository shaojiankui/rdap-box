import { RDAPClient } from '../utils/rdapClient';
import { parseDomain } from '../utils/domainUtils';

export interface LookupResult {
  data: any; // RDAP 标准格式数据
  source: 'rdap' | 'whois'; // 数据来源（作为额外信息）
}

export class LookupService {
  /**
   * 查询域名信息
   * @param domainInput 输入的域名
   * @returns RDAP 格式的数据
   */
  async lookup(domainInput: string): Promise<LookupResult> {
    // 清理输入域名（保留原始格式用于查询）
    let cleanInput = domainInput.toLowerCase().trim();
    cleanInput = cleanInput.replace(/^https?:\/\//, '');
    cleanInput = cleanInput.replace(/^ftp:\/\//, '');
    cleanInput = cleanInput.replace(/\/.*$/, '');
    cleanInput = cleanInput.replace(/\?.*$/, '');
    cleanInput = cleanInput.replace(/#.*$/, '');
    cleanInput = cleanInput.replace(/:\d+$/, '');
    cleanInput = cleanInput.trim();
    
    // 如果清理后的域名不包含点号，默认添加 .com
    if (!cleanInput.includes('.')) {
      cleanInput = `${cleanInput}.com`;
    }
    
    // 解析域名（用于查找服务器）
    const { domain, extension, extensionTop } = await parseDomain(domainInput);
    
    // 使用清理后的输入域名进行查询（保持原始格式）
    const queryDomain = cleanInput;
    
    // 首先尝试 RDAP 查询
    try {
      const rdapData = await this.queryRDAP(queryDomain, extension, extensionTop);
      // 添加数据来源信息到 RDAP 数据中（作为 remarks）
      if (rdapData.data && !rdapData.data.remarks) {
        rdapData.data.remarks = [];
      }
      if (rdapData.data && Array.isArray(rdapData.data.remarks)) {
        rdapData.data.remarks.push({
          title: 'Data Source',
          description: ['This data was retrieved via RDAP protocol'],
        });
      }
      return {
        data: rdapData.data,
        source: 'rdap',
      };
    } catch (rdapError: any) {
      console.log(`RDAP failed for ${queryDomain}: ${rdapError.message}`);
      
      // RDAP 失败，尝试 WHOIS
      try {
        const whoisData = await this.queryWHOIS(queryDomain, extension, extensionTop);
        
        // 添加数据来源信息到 RDAP 数据中（作为 remarks）
        if (whoisData && !whoisData.remarks) {
          whoisData.remarks = [];
        }
        if (whoisData && Array.isArray(whoisData.remarks)) {
          whoisData.remarks.push({
            title: 'Data Source',
            description: ['This data was converted from WHOIS response to RDAP format'],
          });
        }
        
        return {
          data: whoisData,
          source: 'whois',
        };
      } catch (whoisError: any) {
        throw new Error(
          `Both RDAP and WHOIS failed. RDAP: ${rdapError.message}, WHOIS: ${whoisError.message}`
        );
      }
    }
  }
  
  /**
   * RDAP 查询
   */
  private async queryRDAP(
    domain: string,
    extension: string,
    extensionTop?: string
  ): Promise<{ data: any }> {
    const rdapClient = new RDAPClient(domain, extension, extensionTop);
    const result = await rdapClient.getData();
    
    return {
      data: result.data,
    };
  }
  
  /**
   * WHOIS 查询 - 通过 tian.hu API
   */
  private async queryWHOIS(
    domain: string,
    extension: string,
    extensionTop?: string
  ): Promise<any> {
    // domain 参数已经是完整的域名（如 com.st），不需要再拼接 extension
    const fullDomain = domain;
    const apiUrl = `https://api.tian.hu/whois/${encodeURIComponent(fullDomain)}`;
    
    try {
      const response = await $fetch<any>(apiUrl, {
        timeout: 10000, // 10秒超时
      });
      
      if (response.code !== 200 || !response.data) {
        throw new Error(response.message || 'WHOIS query failed');
      }
      
      // 将 formatted 数据转换为 RDAP 格式
      const rdapData = this.convertWhoisToRDAP(response.data, fullDomain);
      
      return rdapData;
    } catch (error: any) {
      throw new Error(`WHOIS API request failed: ${error.message}`);
    }
  }
  
  /**
   * 将 WHOIS formatted 数据转换为 RDAP 格式
   */
  private convertWhoisToRDAP(whoisData: any, fallbackDomain: string): any {
    const formatted = whoisData.formatted || {};
    const domainInfo = formatted.domain || {};
    const registrarInfo = formatted.registrar || {};
    const fullDomain = whoisData.domain || domainInfo.domain || fallbackDomain;
    
    // 构建 RDAP 响应
    const rdapResponse: any = {
      objectClassName: 'domain',
      handle: domainInfo.id || fullDomain,
      ldhName: fullDomain.toLowerCase(),
    };
    
    // Unicode name
    if (domainInfo.domain) {
      rdapResponse.unicodeName = domainInfo.domain;
    }
    
    // Status
    if (domainInfo.status && Array.isArray(domainInfo.status)) {
      rdapResponse.status = domainInfo.status.map((s: string) => s.toLowerCase());
    }
    
    // Nameservers
    if (domainInfo.name_servers && Array.isArray(domainInfo.name_servers)) {
      rdapResponse.nameservers = domainInfo.name_servers.map((ns: string) => ({
        objectClassName: 'nameserver',
        ldhName: ns.toLowerCase(),
      }));
    }
    
    // Events
    const events: any[] = [];
    if (domainInfo.created_date || domainInfo.created_date_utc) {
      events.push({
        eventAction: 'registration',
        eventDate: domainInfo.created_date_utc || domainInfo.created_date,
      });
    }
    if (domainInfo.updated_date || domainInfo.updated_date_utc) {
      events.push({
        eventAction: 'last changed',
        eventDate: domainInfo.updated_date_utc || domainInfo.updated_date,
      });
    }
    if (domainInfo.expired_date || domainInfo.expired_date_utc) {
      events.push({
        eventAction: 'expiration',
        eventDate: domainInfo.expired_date_utc || domainInfo.expired_date,
      });
    }
    if (events.length > 0) {
      rdapResponse.events = events;
    }
    
    // Entities - 注册商
    const entities: any[] = [];
    if (registrarInfo.registrar_name) {
      const registrarEntity: any = {
        objectClassName: 'entity',
        handle: `registrar-${registrarInfo?.registrar_ianaid || 'unknown'}`,
        roles: ['registrar'],
        vcardArray: [
          'vcard',
          [
            ['version', {}, 'text', '4.0'],
            ['fn', {}, 'text', registrarInfo.registrar_name],
          ],
        ],
      };
      
      if (registrarInfo.referral_url) {
        registrarEntity.vcardArray[1].push(['url', { type: 'text' }, 'uri', registrarInfo.referral_url]);
      }
      if (registrarInfo.registrar_email) {
        registrarEntity.vcardArray[1].push(['email', { type: 'text' }, 'text', registrarInfo.registrar_email]);
      }
      if (registrarInfo.registrar_phone) {
        registrarEntity.vcardArray[1].push(['tel', { type: 'text' }, 'text', registrarInfo.registrar_phone]);
      }
      
      entities.push(registrarEntity);
    }
    
    // 添加注册人、管理员、技术联系人等（如果有数据）
    ['registrant', 'administrative', 'technical', 'billing'].forEach((role) => {
      const contactInfo = formatted[role];
      if (contactInfo && Object.keys(contactInfo).length > 0) {
        const entity: any = {
          objectClassName: 'entity',
          handle: `${role}-${domainInfo.id || domainInfo.domain}`,
          roles: [role],
          vcardArray: ['vcard', [['version', {}, 'text', '4.0']]],
        };
        
        // 根据实际数据填充 vcard
        if (contactInfo.name) {
          entity.vcardArray[1].push(['fn', {}, 'text', contactInfo.name]);
        }
        if (contactInfo.email) {
          entity.vcardArray[1].push(['email', { type: 'text' }, 'text', contactInfo.email]);
        }
        if (contactInfo.phone) {
          entity.vcardArray[1].push(['tel', { type: 'text' }, 'text', contactInfo.phone]);
        }
        
        entities.push(entity);
      }
    });
    
    if (entities.length > 0) {
      rdapResponse.entities = entities;
    }
    
    // Links
    rdapResponse.links = [
      {
        value: `https://r.box/domain/${fullDomain}`,
        rel: 'self',
        href: `https://r.box/domain/${fullDomain}`,
        type: 'application/rdap+json',
      },
    ];
    
    // Notices - 从原始 WHOIS 文本中提取
    const notices: any[] = [];
    if (whoisData.result && typeof whoisData.result === 'string') {
      const whoisText = whoisData.result;
      
      // 提取 Terms of Use 相关文本
      const termsMatch = whoisText.match(/TERMS OF USE:([\s\S]*?)(?:\n\n|$)/i);
      if (termsMatch) {
        notices.push({
          title: 'Terms of Service',
          description: termsMatch[1].trim(),
        });
      }
      
      // 提取 ICANN Whois Inaccuracy Complaint Form URL
      const wicfMatch = whoisText.match(/URL of the ICANN Whois Inaccuracy Complaint Form:.*?href=['"]?([^'"\s>]+)['"]?/i);
      if (wicfMatch) {
        notices.push({
          title: 'RDDS Inaccuracy Complaint Form',
          links: [{ value: wicfMatch[1], rel: 'alternate', type: 'text/html' }],
        });
      }
      
      // 提取 Status Codes 相关链接
      const statusCodesMatch = whoisText.match(/For more information on Whois status codes.*?href=['"]?([^'"\s>]+)['"]?/i);
      if (statusCodesMatch) {
        notices.push({
          title: 'Status Codes',
          links: [{ value: statusCodesMatch[1], rel: 'alternate', type: 'text/html' }],
        });
      }
    }
    
    // 如果没有提取到 notices，至少添加一个通用的
    if (notices.length === 0 && whoisData.result) {
      notices.push({
        title: 'Terms of Service',
        description: typeof whoisData.result === 'string' 
          ? whoisData.result.substring(0, 500) + '...' 
          : 'Access to RDAP information is provided to assist persons interested in domains, nameservers, or associated entities.',
      });
    }
    
    if (notices.length > 0) {
      rdapResponse.notices = notices;
    }
    
    // Secure DNS
    if (domainInfo.dnssec !== undefined) {
      rdapResponse.secureDNS = {
        delegationSigned: domainInfo.dnssec,
      };
    }
    
    return rdapResponse;
  }
}

