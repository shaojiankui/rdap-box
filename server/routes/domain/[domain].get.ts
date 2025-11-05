import { LookupService } from '../../services/LookupService';

/**
 * GET /domain/:domain
 * 查询域名信息，返回 RDAP 标准格式
 * 优先使用 RDAP，失败后回退到 WHOIS 并转换为 RDAP 格式
 */
export default defineEventHandler(async (event) => {
  const domainParam = getRouterParam(event, 'domain');
  
  if (!domainParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Domain parameter is required',
    });
  }
  
  try {
    const lookupService = new LookupService();
    const result = await lookupService.lookup(domainParam);
    
    // 直接返回 RDAP 标准格式数据
    return result.data;
  } catch (error: any) {
    // 判断错误类型返回对应的状态码
    const is400Error = 
      error.message.includes('Invalid domain') ||
      error.message.includes('empty') ||
      error.message.includes('must have at least one dot');
    
    throw createError({
      statusCode: is400Error ? 400 : 500,
      statusMessage: is400Error ? 'Bad Request' : 'Internal Server Error',
      message: error.message || 'Query failed',
    });
  }
});

