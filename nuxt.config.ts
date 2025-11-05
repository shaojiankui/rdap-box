// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-11-04',
  
  devtools: { enabled: true },
  
  app: {
    head: {
      title: 'RDAP 域名查询工具',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '基于 RDAP 协议的域名信息查询工具，不支持 RDAP 的域名自动通过 WHOIS 查询并转换' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  
  css: [],
  
  modules: [],
  
  nitro: {
    experimental: {
      tasks: true
    }
  },
})
