import axios from 'axios';
import { toASCII } from './domainUtils';
import { getRDAPServers } from './rdapServers';

interface RDAPServersIANA {
  services: Array<[string[], string[]]>;
}

export class RDAPClient {
  public domain: string;
  public extension: string;
  private extensionTop?: string;
  private servers: Record<string, string> = {};
  
  constructor(domain: string, extension: string, extensionTop?: string) {
    this.domain = domain;
    this.extension = extension;
    this.extensionTop = extensionTop;
  }
  
  async loadServers() {
    // 使用自动更新功能获取 IANA 服务器列表
    const rdapServersIana = await getRDAPServers();
    const rdapServersExtra = await import('../data/rdap-servers-extra.json');
    
    // 解析 IANA 服务器
    if (rdapServersIana && rdapServersIana.services) {
      const services = rdapServersIana.services as Array<[string[], string[]]>;
      for (const service of services) {
        const [tlds, servers] = service;
        const server = servers[0];
        for (const tld of tlds) {
          this.servers[tld] = server;
        }
      }
    }
    
    // 合并额外的服务器
    if (rdapServersExtra.default) {
      Object.assign(this.servers, rdapServersExtra.default);
    }
  }
  
  getServer(): string {
    if (this.extension === 'iana') {
      return 'https://rdap.iana.org/';
    }
    
    // 转换 IDN 域名
    // 逻辑：解析到二级后缀查一级，解析到一级后缀查一级
    // 如果 extension 是多级后缀（如 com.cn），优先尝试使用 extensionTop（cn）
    // 如果 extension 是一级后缀（如 com），直接使用 extension
    let server;
    if (this.extensionTop && this.extension.includes('.')) {
      // 多级后缀，优先使用一级后缀查找
      const asciiExtensionTop = toASCII(this.extensionTop);
      server = this.servers[asciiExtensionTop];
      
      // 如果一级后缀找不到，尝试使用完整后缀
      if (!server) {
        const asciiExtension = toASCII(this.extension);
        server = this.servers[asciiExtension];
      }
    } else {
      // 一级后缀，直接使用
      const asciiExtension = toASCII(this.extension);
      server = this.servers[asciiExtension];
    }
    
    if (!server) {
      throw new Error(`No RDAP server found for '${this.domain}'`);
    }
    
    return server;
  }
  
  async getData(): Promise<{ code: number; data: any; dataStr: string }> {
    await this.loadServers();
    const server = this.getServer();
    
    try {
      const response = await axios.get(`${server}domain/${this.domain}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/rdap+json, application/json',
        },
        validateStatus: () => true, // 接受所有状态码
      });
      
      // 格式化 JSON 字符串
      let dataStr = '';
      if (response.data && typeof response.data === 'object') {
        dataStr = JSON.stringify(response.data, null, 2);
      }
      
      return {
        code: response.status,
        data: response.data,
        dataStr,
      };
    } catch (error: any) {
      throw new Error(error.message || 'RDAP query failed');
    }
  }
}

