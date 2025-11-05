import { readFile, stat, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { isIP } from 'net';

// 获取当前文件的目录路径（ES modules 兼容）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 公共后缀列表 URL
const PUBLIC_SUFFIX_LIST_URL = 'https://publicsuffix.org/list/public_suffix_list.dat';
const SCHEME_RE = /^([abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-.]+:)?\/\//;

// 缓存有效期：30天（一个月）
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// 缓存 TLD 列表
let _cache: string[] | null = null;

// 提取结果接口
export interface ExtractResult {
  subdomain: string;
  domain: string;
  tld: string;
}

interface ExtractInternalResult {
  registered_domain: string;
  tld: string;
}

/**
 * 从 netloc 中提取 TLD 信息
 * 优先匹配更短的后缀，只有当注册域名为空时才尝试更长的后缀
 */
function _extract(tlds: string[], netloc: string): ExtractInternalResult {
  const spl = netloc.split('.');
  let ret: ExtractInternalResult | null = null;
  let bestMatch: ExtractInternalResult | null = null;

  // 从右往左遍历（从最短的 TLD 开始，优先匹配更短的后缀）
  // i 从 spl.length-1 开始，向 0 遍历
  for (let i = spl.length - 1; i >= 0; i--) {
    const maybe_tld = spl.slice(i).join('.');
    const star_tld = '*.' + spl.slice(i + 1).join('.');
    const exception_tld = '!' + maybe_tld;
    const registered_domain = spl.slice(0, i).join('.');

    // 检查异常规则（! 前缀）- 异常规则优先
    if (tlds.indexOf(exception_tld) !== -1) {
      ret = {
        registered_domain: spl.slice(0, i + 1).join('.'),
        tld: spl.slice(i + 1).join('.'),
      };
      return ret; // 异常规则优先，直接返回
    }

    // 检查通配符规则或精确匹配
    if (tlds.indexOf(star_tld) !== -1 || tlds.indexOf(maybe_tld) !== -1) {
      const match = {
        registered_domain: registered_domain,
        tld: maybe_tld,
      };

      // 如果注册域名不为空，这是更好的匹配（优先使用更短的后缀）
      if (registered_domain) {
        ret = match;
        return ret; // 找到有注册域名的匹配，立即返回
      } else {
        // 如果注册域名为空，保存这个匹配，继续尝试更短的 TLD
        bestMatch = match;
      }
    }
  }

  // 如果找到了匹配但注册域名为空，返回最佳匹配
  // 否则返回空结果
  return ret || bestMatch || { registered_domain: netloc, tld: '' };
}

/**
 * 获取 TLD 列表
 * 优先从本地文件读取，如果文件超过一个月则从网络下载更新
 */
async function _getTLDList(): Promise<string[]> {
  if (_cache) {
    return _cache;
  }

  const localPath = join(__dirname, '../data/public_suffix_list.dat');
  let shouldUpdate = false;

  try {
    // 检查文件是否存在及其修改时间
    const stats = await stat(localPath);
    const now = Date.now();
    const fileAge = now - stats.mtimeMs;
    
    // 如果文件超过一个月，标记需要更新
    if (fileAge > CACHE_DURATION_MS) {
      shouldUpdate = true;
      console.log(`Public suffix list is ${Math.floor(fileAge / (24 * 60 * 60 * 1000))} days old, updating...`);
    } else {
      // 文件还在有效期内，直接读取
      const data = await readFile(localPath, 'utf-8');
      _cache = parseTLDList(data);
      return _cache;
    }
  } catch (error) {
    // 文件不存在，需要下载
    shouldUpdate = true;
    console.log('Local public suffix list not found, downloading from publicsuffix.org...');
  }

  // 需要更新或下载
  if (shouldUpdate) {
    try {
      const response = await fetch(PUBLIC_SUFFIX_LIST_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const body = await response.text();
      _cache = parseTLDList(body);
      
      // 保存到本地文件（异步，不阻塞）
      writeFile(localPath, body, 'utf-8').catch(err => {
        console.warn('Failed to save public suffix list to local file:', err);
      });
      
      return _cache;
    } catch (fetchError) {
      // 如果下载失败，尝试读取本地缓存（如果存在）
      try {
        const data = await readFile(localPath, 'utf-8');
        _cache = parseTLDList(data);
        console.warn('Failed to download latest list, using cached version');
        return _cache;
      } catch {
        throw new Error(`Failed to load TLD list: ${fetchError}`);
      }
    }
  }

  return _cache || [];
}

/**
 * 解析公共后缀列表数据
 * 过滤注释行和空行，提取有效的后缀条目
 */
function parseTLDList(data: string): string[] {
  const lines = data.split('\n');
  const tlds: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    // 跳过空行和注释行
    if (!trimmed || trimmed.startsWith('//')) {
      continue;
    }
    // 匹配有效的后缀条目（可能包含 *、! 前缀）
    // 格式：*.example.com, !exception.example.com, example.com
    const match = trimmed.match(/^([.*!]*[\w.-]+)$/);
    if (match) {
      tlds.push(match[1]);
    }
  }
  
  return tlds;
}

/**
 * 提取域名的子域名、域名和 TLD 组件
 * 忽略协议、用户名和路径组件
 * 
 * @param url 要解析的 URL 或域名
 * @returns Promise<ExtractResult>
 */
export async function extract(url: string): Promise<ExtractResult> {
  let netloc = url.replace(SCHEME_RE, '').split('/')[0];
  netloc = netloc.split('@').slice(-1)[0].split(':')[0];

  const tlds = await _getTLDList();
  const obj = _extract(tlds, netloc);
  const tld = obj.tld;
  const registered_domain = obj.registered_domain;

  // 检查是否是 IP 地址
  if (!tld && netloc && !isNaN(Number(netloc[0]))) {
    if (isIP(netloc)) {
      return { subdomain: '', domain: netloc, tld: '' };
    } else {
      throw new Error('No domain/IP detected');
    }
  }

  const domain = registered_domain.split('.').slice(-1)[0];
  const subdomain = registered_domain.split('.').slice(0, -1).join('.');

  return { subdomain, domain, tld };
}

/**
 * 同步版本（如果缓存已加载）
 */
export function extractSync(url: string): ExtractResult {
  if (!_cache) {
    throw new Error('TLD list not loaded. Call extract() first or use extractAsync()');
  }

  let netloc = url.replace(SCHEME_RE, '').split('/')[0];
  netloc = netloc.split('@').slice(-1)[0].split(':')[0];

  const obj = _extract(_cache, netloc);
  const tld = obj.tld;
  const registered_domain = obj.registered_domain;

  if (!tld && netloc && !isNaN(Number(netloc[0]))) {
    if (isIP(netloc)) {
      return { subdomain: '', domain: netloc, tld: '' };
    } else {
      throw new Error('No domain/IP detected');
    }
  }

  const domain = registered_domain.split('.').slice(-1)[0];
  const subdomain = registered_domain.split('.').slice(0, -1).join('.');

  return { subdomain, domain, tld };
}

// 默认导出异步版本
export default extract;
