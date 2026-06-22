# BookNest — 全栈学习路线

BookNest 是一个围绕“个人藏书管理”逐步扩展的全栈实战项目。本仓库当前以 `tasks/` 学习任务文档为主，覆盖从 React 前端、Express 后端、生产部署、安全加固，到多租户 SaaS、订单队列、Taro 小程序、微信登录/支付、内容安全和小程序发布的完整路线。

## 项目目标

通过连续 18 天任务，把一个基础藏书管理应用迭代成可部署、可观测、可测试、具备多端能力和商业化闭环的产品原型。

核心业务从书籍 CRUD 开始，逐步增加分类、评论、认证、上传、分享、Workspace/RBAC、订单、支付、票券、订阅消息、客服消息、内容安全、性能优化和灰度发布。

## 学习路线总览

### 第一阶段：Web 全栈 MVP

| 天数 | 主题 | 主要产出 |
|------|------|----------|
| Day 1 | 前端基础 — React + Tailwind + Zustand | Vite React 前端、基础 UI、书籍列表/详情/表单、localStorage 状态、组件测试 |
| Day 2 | 后端 API — Express + Prisma + PostgreSQL | RESTful API、JWT 认证、Prisma 数据模型、Controller-Service 分层、接口测试 |
| Day 3 | 前后端联调 — React Query + 全栈集成 | Axios API Client、React Query hooks、路由守卫、MSW、Docker Compose 本地联调 |

### 第二阶段：上线、治理与质量工程

| 天数 | 主题 | 主要产出 |
|------|------|----------|
| Day 4 | 上线部署 — CI/CD + 阿里云 + Nginx + HTTPS | ECS、域名/DNS、生产 Docker Compose、Nginx 反向代理、HTTPS、GitHub Actions |
| Day 4 v2 | 上线部署备选 — Self-hosted Runner | 基于 ECS 自托管 Runner 的 CI/CD、生产目录和权限边界、排查手册 |
| Day 5 | 云服务器安全 — 网络防护 + 系统加固 + 备份恢复 | 安全组、SSH/fail2ban、自动更新、Nginx 安全头、数据库备份、安全审计 |
| Day 6 | 进阶后端 — Redis + 文件上传 + WebSocket | Redis 缓存、统计与列表缓存、阿里云 OSS 上传、实时通知、接口限流 |
| Day 7 | 可观测性 & 性能优化 | Winston 结构化日志、错误追踪、深度健康检查、懒加载、Bundle/Lighthouse 优化 |
| Day 8 | 工程化重构 + OpenAPI 接口契约 | ESLint/Prettier、Zod schema、Swagger/OpenAPI、前端类型生成、架构文档 |
| Day 9 | Playwright E2E 自动化测试 + CI 回归 | E2E seed、关键 `data-testid`、登录/CRUD/评论/上传/权限测试、CI 回归 |

### 第三阶段：SaaS 与交易闭环

| 天数 | 主题 | 主要产出 |
|------|------|----------|
| Day 10 | 多租户 SaaS — Workspace / RBAC / Invitation / AuditLog | Workspace 数据模型、成员/角色权限、审计日志、前后端租户隔离 |
| Day 11 | 订单状态机 + 模拟支付 + BullMQ 队列 + 数据库并发 | 订单模型、状态机、幂等支付、BullMQ worker、并发锁、补偿任务 |

### 第四阶段：Taro 小程序与微信生态

| 天数 | 主题 | 主要产出 |
|------|------|----------|
| Day 12 | Taro 工程搭建 + Web 功能迁移盘点 + 核心 UI 迁移 | 小程序工程、TabBar、共享领域类型、核心组件迁移、Web 到小程序迁移地图 |
| Day 13 | API Client + OpenAPI 类型 + 微信登录 + UnionID / 账号绑定 | 小程序请求适配器、OpenAPI 类型、微信登录后端、UnionID、账号绑定 |
| Day 14 | Book CRUD + Workspace/RBAC + 上传 + 分享完整迁移 | 小程序端业务闭环、Workspace 切换、RBAC helper、封面上传、详情分享 |
| Day 15 | 微信支付 + 订单状态机 + 支付回调幂等 + Ticket 发放 | 微信支付预支付、支付回调、支付成功事务、Ticket 发放、查单补偿 |
| Day 16 | 订阅消息 + 客服消息 + 内容安全风控 | 订阅授权、模板消息发送、客服入口、图片/文本内容安全、人工复核 |
| Day 17 | 复杂分包 + 性能极限优化 + Taro 多端适配治理 | 小程序分包策略、首包预算、性能报告、CompileMode、多端适配治理 |
| Day 18 | 小程序 CI/CD + 体验版 + 灰度发布 + 审核策略 + 最终验收 | miniprogram-ci、体验版上传、审核清单、灰度发布、回滚计划、最终演示 |

## 技术版图

| 方向 | 技术与能力 |
|------|------------|
| 前端 Web | React 18、TypeScript、Vite、Tailwind CSS、Zustand、React Hook Form、Zod、React Router、TanStack React Query |
| 后端 API | Node.js、Express、Prisma、PostgreSQL、JWT、bcrypt、Controller-Service 分层、RESTful API |
| 工程质量 | ESLint、Prettier、OpenAPI、Swagger、Zod schema、Jest、Supertest、Vitest、MSW、Playwright |
| 部署运维 | Docker Compose、GitHub Actions、阿里云 ECS、Nginx、HTTPS、Self-hosted Runner、备份恢复 |
| 安全与治理 | 安全组、SSH 加固、fail2ban、Helmet、安全响应、RBAC、审计日志、内容安全 |
| 性能与可观测性 | Redis、Winston、错误追踪、健康检查、限流、懒加载、Bundle 分析、Lighthouse |
| 小程序 | Taro、微信登录、UnionID、微信支付、订阅消息、客服消息、miniprogram-ci、分包优化 |
| 商业闭环 | Workspace、多租户、订单状态机、BullMQ 队列、支付回调幂等、Ticket 发放、灰度发布 |

## 目标架构

```text
Web / Mini Program UI
  -> API Client / Request Adapter
  -> React Query / Taro Store / Domain Hooks
  -> Express REST API
  -> Service Layer
  -> Prisma
  -> PostgreSQL / Redis / BullMQ

支撑能力:
  OpenAPI 契约 -> 类型生成 -> 自动化测试 -> CI/CD -> 生产部署 -> 监控与审计
```

## 端口规划

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 Web (Vite) | 4001 | `http://localhost:4001` |
| 后端 API (Express) | 4000 | `http://localhost:4000` |
| PostgreSQL | 5433 | `localhost:5433` 映射到容器内 `5432` |
| Redis | 6379 | Day 6 之后引入 |
| Playwright / CI 测试数据库 | 55432 | Day 9 / Day 4 v2 中用于隔离测试环境 |

## 目标项目结构

随着任务推进，项目会从文档仓库逐步形成类似结构：

```text
booknest/
├── frontend/                  # React Web 应用
│   └── src/
│       ├── components/        # UI 与业务组件
│       ├── pages/             # 页面
│       ├── hooks/             # React Query hooks
│       ├── stores/            # Zustand stores
│       ├── lib/               # API client、query client、工具函数
│       ├── mocks/             # MSW mocks
│       └── types/             # Web 端类型
├── backend/                   # Express API
│   ├── prisma/                # schema、migrations、seed
│   └── src/
│       ├── controllers/       # 请求处理层
│       ├── services/          # 业务逻辑层
│       ├── routes/            # 路由定义
│       ├── middleware/        # auth、validate、workspace、error handler
│       ├── jobs/              # BullMQ worker 与补偿任务
│       └── lib/               # Prisma、Redis、OpenAPI 等基础设施
├── miniapp/                   # Taro 小程序
│   └── src/
│       ├── pages/             # 小程序页面
│       ├── components/        # Taro 组件
│       ├── services/          # request adapter 与业务 service
│       └── stores/            # 小程序端状态
├── packages/
│   └── shared/                # 共享领域类型和工具
├── docs/                      # 架构、迁移地图、发布与审核文档
├── tests/
│   └── e2e/                   # Playwright E2E
├── docker-compose.yml
├── docker-compose.prod.yml
└── tasks/                     # 本仓库维护的每日学习任务
```

## 快速开始

任务文档是本仓库的主要入口。建议按天顺序阅读并执行：

```bash
# 查看任务目录
ls tasks

# 从 Day 1 开始
cat tasks/day1-frontend.md
```

完成到 Day 3 后，典型本地运行方式如下：

```bash
# 启动 PostgreSQL
docker run -d --name booknest-pg \
  -e POSTGRES_USER=booknest \
  -e POSTGRES_PASSWORD=booknest123 \
  -e POSTGRES_DB=booknest \
  -p 5433:5432 \
  postgres:16-alpine

# 启动后端
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run prisma:seed
npm run dev

# 启动前端
cd ../frontend
npm install
npm run dev
```

访问入口：

| 服务 | 地址 |
|------|------|
| 前端 Web | `http://localhost:4001` |
| 后端健康检查 | `http://localhost:4000/health` |
| Swagger 文档 | `http://localhost:4000/api-docs` |

## 学习任务索引

| 文件 | 内容 |
|------|------|
| `tasks/day1-frontend.md` | Day 1 前端基础完整指南 |
| `tasks/day2-backend.md` | Day 2 后端 API 完整指南 |
| `tasks/day3-integration.md` | Day 3 前后端联调完整指南 |
| `tasks/day4-deploy.md` | Day 4 阿里云部署、Nginx、HTTPS 与 CI/CD 指南 |
| `tasks/day4-deploy-v2-self-hosted-runner.md` | Day 4 v2 Self-hosted Runner 部署备选方案 |
| `tasks/day5-security.md` | Day 5 云服务器安全加固与备份恢复指南 |
| `tasks/day6-advanced-backend.md` | Day 6 Redis、文件上传、WebSocket 与限流指南 |
| `tasks/day7-observability.md` | Day 7 日志、监控、健康检查与性能优化指南 |
| `tasks/day8-engineering-openapi.md` | Day 8 工程化重构与 OpenAPI 契约指南 |
| `tasks/day9-playwright-e2e-ci.md` | Day 9 Playwright E2E 与 CI 回归指南 |
| `tasks/day10-multitenancy-rbac.md` | Day 10 多租户、RBAC、邀请与审计日志指南 |
| `tasks/day11-orders-queue-db.md` | Day 11 订单状态机、队列与数据库并发指南 |
| `tasks/day12-taro-web-migration.md` | Day 12 Taro 工程与 Web 到小程序迁移指南 |
| `tasks/day13-api-wechat-login-unionid.md` | Day 13 小程序 API Client、微信登录与账号绑定指南 |
| `tasks/day14-business-rbac-upload-share.md` | Day 14 小程序业务、权限、上传与分享迁移指南 |
| `tasks/day15-wechat-pay-order-ticket.md` | Day 15 微信支付、回调幂等与 Ticket 发放指南 |
| `tasks/day16-subscribe-customer-service-content-security.md` | Day 16 订阅消息、客服消息与内容安全指南 |
| `tasks/day17-subpackages-performance.md` | Day 17 分包、性能优化与 Taro 多端治理指南 |
| `tasks/day18-mini-ci-review-release.md` | Day 18 小程序 CI/CD、体验版、审核与发布指南 |

每份任务文档通常包含：项目简介、学习目标、技术栈、功能清单、分步实施指南、验收标准、Git Commit 示例、Prompt 模板、每日回顾或反馈。Day 12 之后还补充了参考资料和阶段统一约定。
