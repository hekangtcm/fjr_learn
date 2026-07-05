# BookNest Architecture

### 1. 系统概览

BookNest 是一个全栈藏书管理系统，包含：

- **frontend**: React + TypeScript + Vite + Tailwind CSS + Zustand + React Query
- **backend**: Express + TypeScript + Prisma + Zod + OpenAPI
- **database**: SQLite (dev) / PostgreSQL (prod)
- **cache**: Redis (ioredis, cache-aside 模式)
- **storage**: 本地文件存储 (Multer) / 阿里云 OSS (prod)
- **realtime**: Socket.IO (JWT 认证 + 房间推送)
- **deployment**: Docker Compose + Nginx + GitHub Actions CI/CD
- **observability**: Winston 结构化日志 + Morgan HTTP 请求日志 + 健康检查

### 2. 数据流

```
用户操作 UI
→ React Query hook
→ Axios API client (带 JWT token)
→ Express route
→ Zod validate middleware
→ Controller
→ Service (业务逻辑 + Redis 缓存)
→ Prisma / Redis / OSS
→ 返回响应
→ React Query 更新缓存
→ UI 重新渲染
→ Socket.IO 实时推送 (可选)
```

### 3. 认证流程

```
登录/注册
→ 后端验证 → 生成 JWT
→ 前端存入 auth store (localStorage + Zustand)
→ Axios 拦截器注入 Authorization header
→ 后端 authenticate middleware 校验 token
→ 解析 userId 附加到 req.user
```

### 4. 服务端分层

| 层 | 职责 | 文件示例 |
|----|------|---------|
| routes | 路径定义 + 中间件链 | `book.routes.ts` |
| controllers | 解析请求，返回响应 | `book.controller.ts` |
| services | 业务逻辑 + 缓存 | `book.service.ts` |
| schemas | 请求/响应 Zod schema | `book.schema.ts` |
| lib | 基础设施 (prisma, redis, logger, socket, openapi) | `prisma.ts`, `redis.ts` |
| middleware | 认证、校验、错误处理、限流 | `auth.ts`, `zodValidate.ts`, `errorHandler.ts` |

### 5. 接口契约

- 接口 schema 使用 **Zod** 定义，同时用于运行时校验和类型推导
- OpenAPI 文档通过 **@asteasolutions/zod-to-openapi** 从 Zod schema 自动生成
- Swagger UI 暴露于 `/api-docs`
- OpenAPI JSON 暴露于 `/openapi.json`
- 前端通过 **openapi-typescript** 从 OpenAPI JSON 生成 API 类型 (`api.generated.ts`)

### 6. 缓存策略

采用 **Cache-Aside** 模式：
- 读取时先查 Redis，cache miss 后查数据库并写缓存
- 写入 Book / Category / Review 后清理相关缓存 key
- 列表缓存 TTL: 2 分钟，详情缓存 TTL: 5 分钟
- Redis 未安装时自动降级为直接数据库访问（开发环境）

### 7. 部署架构

```
用户请求 HTTPS 域名
→ Nginx (反向代理 + 负载均衡 + SSL 终止)
→ 前端静态资源 / 后端 API 路由
→ Docker Compose 中的 frontend / backend / postgres / redis
```

### 8. 代码质量

- **ESLint**: TypeScript 静态检查 (`no-explicit-any: warn`, `no-unused-vars: warn`)
- **Prettier**: 代码格式化 (`semi: false`, `singleQuote: true`, `trailingComma: all`)
- **Zod**: 运行时 schema 校验替代 express-validator
- **Jest**: 后端集成测试 (12 tests)
- **Vitest**: 前端单元测试 (10 tests)
- **CI/CD**: GitHub Actions 自动 lint + build + test + deploy

### 9. 安全策略

- CORS 白名单 (开发: localhost, 生产: 域名)
- Helmet HTTP 安全头 (HSTS, CSP)
- JWT 认证 + bcrypt 密码哈希
- express-rate-limit 接口限流 (auth: 5/15min, API: 100/min, upload: 10/min)
- 文件上传大小限制 (5MB) + 类型白名单
- 数据库连接加密 (PostgreSQL SSL)
