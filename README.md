# RDAP 域名查询工具

基于 Nuxt 4 构建的 RDAP 协议域名信息查询工具。对于不支持 RDAP 的域名，自动通过 WHOIS 查询。

## 功能特性

- ✨ 支持 RDAP 协议查询
- 🔄 自动 WHOIS 回退
- 🌙 暗黑主题界面
- 📊 多种数据展示格式（格式化、JSON、原始数据）
- 🚀 基于 Nuxt 4 + TypeScript
- 🎨 现代化 UI/UX 设计
- 🌍 支持 IDN 国际化域名

## 当前进度

✅ **已完成 - 查询功能**
- RDAP 协议查询（支持所有 IANA 注册的 TLD）
- WHOIS 协议查询（自动回退机制）
- 域名解析（使用 psl 库，支持 IDN 国际化域名）
- 前端暗黑主题界面
- 多数据源展示（RDAP JSON / WHOIS 原始文本）

⏳ **待实现 - 解析功能**
- WHOIS 文本数据解析器（Parser 类）
- RDAP JSON 数据解析器（ParserRDAP 类）
- WHOIS 到 RDAP 格式转换
- 统一的结构化数据输出

## 技术栈

- **框架**: Nuxt 4
- **前端**: Vue 3 + TypeScript
- **后端**: Node.js (Nitro)
- **HTTP 客户端**: Axios
- **协议支持**: RDAP + WHOIS

## 项目结构

```
rdap-box/
├── app/
│   └── app.vue                  # 主应用页面
├── server/
│   ├── api/                      # API 路由
│   │   ├── lookup.post.ts       # 统一查询接口
│   │   ├── rdap.post.ts         # RDAP 查询接口
│   │   └── whois.post.ts        # WHOIS 查询接口
│   ├── data/                     # 服务器数据文件
│   │   ├── rdap-servers-iana.json
│   │   ├── rdap-servers-extra.json
│   │   ├── whois-servers-iana.json
│   │   └── whois-servers-extra.json
│   └── utils/                    # 工具函数
│       ├── rdapClient.ts        # RDAP 客户端
│       ├── whoisClient.ts       # WHOIS 客户端
│       └── whoisToRdap.ts       # WHOIS 到 RDAP 转换器
├── public/                       # 静态资源
├── nuxt.config.ts               # Nuxt 配置
└── package.json                 # 依赖配置
```

## 安装与运行

### 安装依赖

```bash
yarn install
```

### 开发模式

```bash
yarn dev
```

访问 http://localhost:3000

### 生产构建

```bash
yarn build
```

### 预览生产版本

```bash
yarn preview
```

## API 接口

### 1. 统一查询接口

**POST** `/api/lookup`

自动选择 RDAP 或 WHOIS 查询。

请求体：
```json
{
  "domain": "example.com"
}
```

响应：
```json
{
  "success": true,
  "source": "rdap",
  "domain": "example.com",
  "extension": "com",
  "code": 200,
  "data": {
    "objectClassName": "domain",
    "ldhName": "example.com",
    ...
  }
}
```

### 2. RDAP 查询接口

**POST** `/api/rdap`

直接进行 RDAP 查询。

请求体：
```json
{
  "domain": "example.com",
  "extension": "com"
}
```

### 3. WHOIS 查询接口

**POST** `/api/whois`

进行 WHOIS 查询，可选择转换为 RDAP 格式。

请求体：
```json
{
  "domain": "example.com",
  "extension": "com",
  "convertToRdap": true
}
```

## 工作原理

1. **用户输入域名** → 系统使用 psl 库解析域名和后缀
2. **尝试 RDAP 查询** → 从 RDAP 服务器列表中查找对应服务器并获取数据
3. **如果 RDAP 失败** → 自动回退到 WHOIS 查询
4. **返回原始数据** → RDAP 返回 JSON 格式，WHOIS 返回原始文本
5. **（待实现）** → WHOIS 数据解析和转换为 RDAP 格式

## 数据源

- **RDAP 服务器列表**: 基于 IANA 官方数据
- **WHOIS 服务器列表**: 基于 IANA 官方数据 + 扩展列表

## 浏览器支持

- Chrome/Edge (最新版)
- Firefox (最新版)
- Safari (最新版)

## 许可证

MIT License

## 参考项目

本项目参考了 [whois-domain-lookup](https://github.com/OWNER/whois-domain-lookup) 的实现逻辑。
