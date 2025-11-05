import { connect, Socket } from 'node:net';
import { toASCII } from './domainUtils';

export class WHOISClient {
  public domain: string;
  public extension: string;
  private extensionTop?: string;
  private servers: Record<string, any> = {};
  
  constructor(domain: string, extension: string, extensionTop?: string) {
    this.domain = domain;
    this.extension = extension;
    this.extensionTop = extensionTop;
  }
  
  async loadServers() {
    const whoisServersIana = await import('../data/whois-servers-iana.json');
    const whoisServersExtra = await import('../data/whois-servers-extra.json');
    
    if (whoisServersIana.default) {
      Object.assign(this.servers, whoisServersIana.default);
    }
    
    if (whoisServersExtra.default) {
      Object.assign(this.servers, whoisServersExtra.default);
    }
  }
  
  getServer(): string | { host: string; query: string } {
    if (this.extension === 'iana') {
      return 'whois.iana.org';
    }
    
    const asciiExtension = toASCII(this.extension);
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
      throw new Error(`No WHOIS server found for '${this.domain}'`);
    }
    
    return server;
  }
  
  async getData(): Promise<string> {
    await this.loadServers();
    const serverConfig = this.getServer();
    
    const asciiDomain = toASCII(this.domain);
    
    let host: string;
    let query: string;
    
    if (typeof serverConfig === 'string') {
      host = serverConfig;
      query = `${asciiDomain}\r\n`;
    } else {
      host = serverConfig.host;
      query = serverConfig.query.replace('{domain}', asciiDomain);
    }
    
    return new Promise((resolve, reject) => {
      const socket = connect({ host, port: 43, timeout: 10000 });
      let data = '';
      
      socket.on('connect', () => {
        socket.write(query);
      });
      
      socket.on('data', (chunk: Buffer) => {
        data += chunk.toString('utf8');
      });
      
      socket.on('end', () => {
        resolve(data);
      });
      
      socket.on('error', (error: Error) => {
        reject(error);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
    });
  }
}

