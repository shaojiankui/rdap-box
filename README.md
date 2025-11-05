# RDAP Box

基于 Nuxt 4 构建的 RDAP 协议域名信息查询工具。对于不支持 RDAP 的域名，自动通过 WHOIS 查询并转换为 RDAP 格式。

## 功能特性

- ✨ 支持 RDAP 协议查询（1500+ TLD）
- 🔄 自动 WHOIS 回退并转换为 RDAP 格式
- 🌙 暗黑主题界面
- 📱 响应式设计，完美适配移动端
- 🚀 基于 Nuxt 4 + TypeScript
- 🎨 现代化 UI/UX 设计
- 🌍 支持 IDN 国际化域名
- 🔄 自动更新 RDAP 服务器列表（从 IANA）
- 🔄 自动更新 Public Suffix List（从 Mozilla）
- 📊 统一 RDAP 格式数据输出
- 📝 查询历史记录（最多 20 条）
- 🔗 支持动态路由 `/域名` 直接查询

## 已完成功能

✅ **查询功能**
- RDAP 协议查询（支持所有 IANA 注册的 TLD）
- WHOIS 协议查询（自动回退机制）
- WHOIS 数据自动转换为 RDAP 格式
- 域名解析（自定义 tldextract，支持多级 TLD 如 com.cn、com.st）
- 支持多级后缀智能解析（解析到二级后缀查二级，解析到一级后缀查一级）

✅ **前端功能**
- 暗黑主题界面
- 响应式设计（移动端优化）
- 查询历史记录（LocalStorage，最多 20 条）
- 动态路由支持（`/域名` 直接查询）
- 折叠式信息展示
- 数据源标识（RDAP/WHOIS）

✅ **数据管理**
- RDAP 服务器列表自动更新（30 天缓存）
- Public Suffix List 自动更新（30 天缓存）
- 本地缓存机制（网络失败时使用缓存）

## 技术栈

- **框架**: Nuxt 4
- **前端**: Vue 3 + TypeScript
- **后端**: Node.js (Nitro)
- **HTTP 客户端**: Axios
- **协议支持**: RDAP + WHOIS
- **域名解析**: 自定义 tldextract（基于 Public Suffix List）
- **数据源**:
  - RDAP 服务器列表：<https://data.iana.org/rdap/dns.json>
  - Public Suffix List：<https://publicsuffix.org/list/public_suffix_list.dat>
  - WHOIS API：<https://api.tian.hu/whois/>

## 项目结构

```
rdap-box/
├── app/
│   ├── components/
│   │   ├── query.vue            # 查询组件（主界面）
│   │   ├── Info.vue             # 信息展示组件
│   │   └── TheHeader.vue        # 头部组件
│   └── pages/
│       ├── index.vue             # 首页
│       └── [domain].vue         # 动态路由页面
├── server/
│   ├── routes/
│   │   └── domain/
│   │       └── [domain].get.ts  # 域名查询 API
│   ├── services/
│   │   └── LookupService.ts     # 查询服务（RDAP + WHOIS）
│   ├── data/                     # 数据文件（自动更新）
│   │   ├── rdap-servers-iana.json
│   │   ├── rdap-servers-extra.json
│   │   └── public_suffix_list.dat
│   └── utils/                    # 工具函数
│       ├── rdapClient.ts        # RDAP 客户端
│       ├── rdapServers.ts       # RDAP 服务器列表管理（自动更新）
│       ├── whoisClient.ts       # WHOIS 客户端
│       ├── domainUtils.ts       # 域名解析工具
│       └── tldextract.ts        # TLD 提取工具（基于 PSL）
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

访问 <http://localhost:3000>

### 生产构建

```bash
yarn build
```

### 预览生产版本

```bash
yarn preview
```

## API 接口

### 域名查询接口

**GET** `/domain/:domain`

自动选择 RDAP 或 WHOIS 查询，直接返回标准 RDAP 格式数据（无额外包装）。

**请求参数**:

- `domain` (路径参数): 要查询的域名，支持 URL 编码

**示例**:

- `GET /domain/example.com`
- `GET /domain/example.cn`
- `GET /domain/example.com.cn`
- `GET /domain/example%2Ecom` (URL 编码)

**成功响应** (200 OK):

直接返回标准 RDAP JSON 格式数据：

```json
{
  "objectClassName": "domain",
  "handle": "example.com",
  "ldhName": "example.com",
  "unicodeName": "example.com",
  "status": ["clientTransferProhibited"],
  "nameservers": [
    {
      "objectClassName": "nameserver",
      "ldhName": "ns1.example.com"
    }
  ],
  "events": [
    {
      "eventAction": "registration",
      "eventDate": "2023-01-01T00:00:00Z"
    }
  ],
  "entities": [...],
  "links": [...],
  "remarks": [
    {
      "title": "Data Source",
      "description": ["This data was retrieved via RDAP protocol"]
    }
  ]
}
```

**错误响应**:

- **400 Bad Request**: 域名参数无效或缺失

  ```json
  {
    "statusCode": 400,
    "statusMessage": "Bad Request",
    "message": "Domain parameter is required"
  }
  ```

- **500 Internal Server Error**: 查询失败（RDAP 和 WHOIS 都失败）

  ```json
  {
    "statusCode": 500,
    "statusMessage": "Internal Server Error",
    "message": "Both RDAP and WHOIS failed. RDAP: ..., WHOIS: ..."
  }
  ```

**数据来源标识**:

- **RDAP 数据**: `remarks` 数组中包含 `{"title": "Data Source", "description": ["This data was retrieved via RDAP protocol"]}`
- **WHOIS 数据**: `remarks` 数组中包含 `{"title": "Data Source", "description": ["This data was converted from WHOIS response to RDAP format"]}`

## 工作原理

1. **用户输入域名** → 系统使用自定义 tldextract 解析域名和后缀（基于 Public Suffix List）
2. **智能后缀解析**：
   - 多级后缀（如 `com.cn`）优先查找一级后缀（`cn`）的服务器
   - 如果一级后缀服务器不存在，回退到完整后缀（`com.cn`）
   - 支持三级及以上后缀的智能解析
3. **尝试 RDAP 查询** → 从自动更新的 RDAP 服务器列表中查找对应服务器并获取数据
4. **如果 RDAP 失败** → 自动回退到 WHOIS 查询（通过第三方 API）
5. **WHOIS 转换** → WHOIS 数据自动转换为标准 RDAP 格式
6. **返回统一格式** → 所有数据以标准 RDAP JSON 格式返回

## 数据自动更新

项目会自动从官方源下载和更新数据：

- **RDAP 服务器列表**：从 `https://data.iana.org/rdap/dns.json` 下载，30 天缓存
- **Public Suffix List**：从 `https://publicsuffix.org/list/public_suffix_list.dat` 下载，30 天缓存

首次运行或缓存过期时自动更新，网络失败时使用本地缓存。

## 使用方式

### Web 界面

1. 访问首页，输入域名查询
2. 或直接访问 `/域名` 路由（如 `/example.com`）进行查询
3. 查看查询历史，快速重新查询

### API 调用

```bash
# 查询域名
curl http://localhost:3003/domain/example.com

# 查询 IDN 域名
curl http://localhost:3003/domain/例子.中国
```

## 数据源

- **RDAP 服务器列表**: IANA 官方数据（自动更新）
- **Public Suffix List**: Mozilla 维护（自动更新）
- **WHOIS 查询**: 通过第三方 API（tian.hu）

## 浏览器支持

- Chrome/Edge (最新版)
- Firefox (最新版)
- Safari (最新版)

## 许可证

MIT License

## 参考项目

本项目参考了 [whois-domain-lookup](https://github.com/OWNER/whois-domain-lookup) 的实现逻辑。
