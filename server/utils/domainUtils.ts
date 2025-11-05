/**
 * 域名解析工具 - 使用 tldextract 解析域名
 */
import { extract, ExtractResult } from './tldextract';

export interface ParsedDomain {
  domain: string;           // 完整域名
  extension: string;        // 顶级域名后缀
  extensionTop?: string;    // 顶级后缀（用于 co.uk 这种情况）
}

/**
 * 解析域名，提取域名和后缀
 */
export async function parseDomain(input: string): Promise<ParsedDomain> {
  // 清理输入
  let domain = input.toLowerCase().trim();
  
  // 移除协议
  domain = domain.replace(/^https?:\/\//, '');
  domain = domain.replace(/^ftp:\/\//, '');
  
  // 移除路径、查询参数、片段
  domain = domain.replace(/\/.*$/, '');
  domain = domain.replace(/\?.*$/, '');
  domain = domain.replace(/#.*$/, '');
  
  // 移除端口
  domain = domain.replace(/:\d+$/, '');
  
  // 移除空格
  domain = domain.trim();
  
  if (!domain) {
    throw new Error('Invalid domain: empty');
  }
  
  // 如果清理后的域名不包含点号，默认添加 .com
  if (!domain.includes('.')) {
    domain = `${domain}.com`;
  }
  
  // 使用 extract 解析域名
  const result: ExtractResult = await extract(domain);
  
  // 处理 IP 地址或无效域名
  if (!result.tld) {
    if (result.domain && !result.subdomain) {
      // 可能是 IP 地址
      throw new Error('Invalid domain format: must have at least one dot');
    }
    throw new Error('Invalid domain format: must have at least one dot');
  }
  
  // 处理特殊情况：如果 domain 为空且 tld 是多级后缀（如 com.cn 被解析为 domain: '', tld: 'com.cn'）
  // 或者 tld 是多级后缀但我们需要"解析到二级后缀查一级"的逻辑
  // 这种情况应该将 tld 的第一部分作为 domain，剩余部分作为 tld
  let finalDomain = result.domain;
  let finalTld = result.tld;
  
  // 如果 domain 为空且 tld 是多级后缀，拆分 tld
  // 例如：com.cn -> domain: '', tld: 'com.cn' -> domain: 'com', tld: 'cn'
  // 例如：com.st -> domain: '', tld: 'com.st' -> domain: 'com', tld: 'st'
  if (!result.domain && result.tld.includes('.')) {
    const tldParts = result.tld.split('.');
    finalDomain = tldParts[0];
    finalTld = tldParts.slice(1).join('.');
  }
  
  // 确保 finalDomain 不为空
  if (!finalDomain) {
    throw new Error(`Invalid domain: cannot extract domain name from '${input}'`);
  }
  
  // 构建完整域名
  // result.domain 是域名主体部分（如 example），result.subdomain 是子域名（如 www）
  // 如果没有子域名，直接使用 domain.tld；如果有子域名，使用 subdomain.domain.tld
  const fullDomain = result.subdomain && result.subdomain.trim() 
    ? `${result.subdomain}.${finalDomain}.${finalTld}`
    : `${finalDomain}.${finalTld}`;
  
  // extract 已经正确解析了多级 TLD
  // 逻辑：解析到二级后缀查一级，解析到一级后缀查一级
  // 例如：
  //   - com.cn -> 解析为 domain: 'com', tld: 'cn' -> extension: 'cn' -> 查 cn
  //   - www.com.cn -> 解析为 domain: 'www', tld: 'com.cn' -> extension: 'com.cn', extensionTop: 'cn' -> 查 cn（优先）
  //   - com.st -> 解析为 domain: 'com', tld: 'st' -> extension: 'st' -> 查 st
  //   - www.com.st -> 解析为 domain: 'www', tld: 'com.st' -> extension: 'com.st', extensionTop: 'st' -> 查 st（优先）
  const extension = finalTld;
  let extensionTop: string | undefined;
  
  // 如果 TLD 是多级后缀（包含点），提取最后一级作为 extensionTop
  // 例如：com.cn -> extensionTop: cn, com.st -> extensionTop: st, co.uk -> extensionTop: uk
  if (finalTld.includes('.')) {
    extensionTop = finalTld.split('.').pop();
  }
  
  return {
    domain: fullDomain,
    extension,
    extensionTop,
  };
}

/**
 * 转换域名为 ASCII（处理 IDN）
 */
export function toASCII(domain: string): string {
  try {
    // 使用 URL API 转换 IDN 域名为 ASCII (Punycode)
    const url = new URL(`http://${domain}`);
    return url.hostname;
  } catch {
    // 如果转换失败，返回原域名
    return domain;
  }
}

/**
 * 转换 ASCII 域名为 Unicode（解码 IDN）
 */
export function toUnicode(domain: string): string {
  try {
    // URL API 会自动解码 Punycode 为 Unicode
    const url = new URL(`http://${domain}`);
    return url.hostname;
  } catch {
    return domain;
  }
}

