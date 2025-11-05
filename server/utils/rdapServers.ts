import { readFile, stat, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RDAP_SERVERS_URL = 'https://data.iana.org/rdap/dns.json';
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30天
const LOCAL_CACHE_PATH = join(__dirname, '../data/rdap-servers-iana.json');

let _cache: any = null;

/**
 * 获取 RDAP 服务器列表
 * 优先从本地文件读取，如果文件超过30天则从网络下载更新
 */
export async function getRDAPServers(): Promise<any> {
  if (_cache) {
    return _cache;
  }

  let shouldUpdate = false;

  try {
    // 检查文件是否存在及其修改时间
    const stats = await stat(LOCAL_CACHE_PATH);
    const now = Date.now();
    const fileAge = now - stats.mtimeMs;
    
    // 如果文件超过30天，标记需要更新
    if (fileAge > CACHE_DURATION_MS) {
      shouldUpdate = true;
      console.log(`RDAP servers list is ${Math.floor(fileAge / (24 * 60 * 60 * 1000))} days old, updating...`);
    } else {
      // 文件还在有效期内，直接读取
      const data = await readFile(LOCAL_CACHE_PATH, 'utf-8');
      _cache = JSON.parse(data);
      return _cache;
    }
  } catch (error) {
    // 文件不存在，需要下载
    shouldUpdate = true;
    console.log('Local RDAP servers list not found, downloading from IANA...');
  }

  // 需要更新或下载
  if (shouldUpdate) {
    try {
      const response = await fetch(RDAP_SERVERS_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      _cache = data;
      
      // 保存到本地文件（异步，不阻塞）
      writeFile(LOCAL_CACHE_PATH, JSON.stringify(data, null, 2), 'utf-8').catch(err => {
        console.warn('Failed to save RDAP servers list to local file:', err);
      });
      
      return _cache;
    } catch (fetchError: any) {
      // 如果下载失败，尝试读取本地缓存（如果存在）
      try {
        const data = await readFile(LOCAL_CACHE_PATH, 'utf-8');
        _cache = JSON.parse(data);
        console.warn('Failed to download latest RDAP servers list, using cached version');
        return _cache;
      } catch {
        throw new Error(`Failed to load RDAP servers list: ${fetchError.message}`);
      }
    }
  }

  return _cache;
}

