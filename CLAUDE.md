# BookNest — 个人藏书管理系统

## 项目简介

全栈 Web 应用：React 前端 + Express 后端 + PostgreSQL 数据库。支持书籍管理、分类、评论、统计仪表盘，完整 CI/CD 自动部署到阿里云 ECS。

## 技术栈

### 前端
- React 18 + TypeScript + Vite 8
- Tailwind CSS v3 + 暗黑模式
- React Router v6 + Zustand 状态管理
- React Query (TanStack Query) + Axios
- MSW (Mock Service Worker) 测试

### 后端
- Express 5 + TypeScript + Prisma 5
- SQLite (开发) / PostgreSQL (生产)
- JWT 认证 + bcrypt 密码加密
- Jest + Supertest 测试

### 部署
- Docker + Docker Compose 多阶段构建
- Nginx 反向代理 + SSL 终止
- GitHub Actions CI/CD (SSH 部署到 ECS)
- Let's Encrypt 自动 SSL 证书

## 快速开始

### 开发环境

```bash
# 1. 启动后端 (端口 4000)
cd backend
npm install
npm run dev

# 2. 启动前端 (端口 4001)
cd frontend
npm install
npm run dev

# 3. 访问 http://localhost:4001
```

### 生产环境 (Docker)

```bash
# 1. 创建环境变量
cat > .env <<EOF
DB_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
EOF

# 2. 启动
docker compose -f docker-compose.prod.yml up -d --build

# 3. 检查
curl http://localhost:4000/health
curl http://localhost/health
```

## 项目结构

```
booknest/
├── frontend/                  # React SPA
│   ├── src/pages/             # 10 个页面
│   ├── src/hooks/             # React Query hooks
│   ├── src/stores/            # Zustand stores
│   ├── src/components/          # UI 组件 + Layout
│   ├── src/lib/               # api-client + query-client
│   ├── src/mocks/             # MSW handlers
│   ├── Dockerfile             # Node build + Nginx serve
│   └── nginx.conf             # SPA 路由配置
├── backend/                   # Express API
│   ├── src/routes/            # Auth/Book/Category/Review/Stats
│   ├── prisma/
│   │   ├── schema.prisma      # 数据模型 (SQLite/PostgreSQL)
│   │   └── seed.ts            # 种子数据
│   ├── Dockerfile             # 多阶段构建
│   └── tests/                 # Jest 测试
├── nginx/
│   └── booknest.conf          # 宿主机 Nginx 反向代理
├── docker-compose.prod.yml    # 生产编排 (PostgreSQL + 前后端)
├── .github/workflows/
│   └── deploy.yml             # CI/CD 流水线
└── .env.production            # 生产环境变量 (不提交到 Git)
```

## 端口

| 环境 | 前端 | 后端 | 数据库 |
|------|------|------|--------|
| 开发 | localhost:4001 | localhost:4000 | SQLite (本地文件) |
| 生产 Docker | frontend:80 | backend:4000 | postgres:5432 |
| 生产入口 | 80/443 (Nginx) | 4000 (内部) | 5432 (内部) |

## 数据流

```
用户浏览器
  → Nginx (HTTPS)
    → /api/* → backend:4000 (Express API)
    → /*     → frontend:80 (React SPA)
      → Prisma Client → PostgreSQL
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/v1/auth/register | 注册 |
| POST | /api/v1/auth/login | 登录 |
| GET | /api/v1/books | 书籍列表 |
| POST | /api/v1/books | 添加书籍 |
| GET | /api/v1/books/:id | 书籍详情 |
| PUT | /api/v1/books/:id | 更新书籍 |
| DELETE | /api/v1/books/:id | 删除书籍 |
| GET | /api/v1/categories | 分类列表 |
| POST | /api/v1/categories | 添加分类 |
| GET | /api/v1/stats | 统计数据 |
| GET | /health | 健康检查 |

## 认证

- 注册/登录后获取 JWT Token
- Token 存储在 localStorage
- Axios 拦截器自动注入 Authorization 头部
- 未登录用户自动重定向到 /login

## 部署架构

```
开发 PC
  │
  │ git push origin main
  ▼
GitHub Repository
  │
  │ 触发 GitHub Actions
  ▼
GitHub-hosted Runner (ubuntu-latest)
  │
  ├── Test Job
  │     ├── PostgreSQL service container
  │     ├── 后端测试: npm ci + prisma + jest
  │     └── 前端测试: npm ci + build + vitest
  │
  └── Deploy Job (仅 main push)
        ├── appleboy/ssh-action
        │     host: ECS_IP
        │     username: deploy
        │     key: SSH_KEY
        │     script:
        │       git pull + docker compose up -d --build
        │
        └── 公网健康检查
                  │
                  ▼
用户 → https://yourdomain.com (Nginx)
  ├── /api/* → backend:4000
  └── /*     → frontend:80
```

## CI/CD

| Job | Runner | 触发条件 | 说明 |
|-----|--------|----------|------|
| test | ubuntu-latest | push/PR | 测试后端 + 前端 |
| deploy | ubuntu-latest | main push | SSH 到 ECS 部署 |

### 需要的 GitHub Secrets

| Secret | 说明 |
|--------|------|
| ECS_HOST | ECS 公网 IP |
| ECS_USER | SSH 用户 (deploy) |
| ECS_SSH_KEY | SSH 私钥 |
| DB_PASSWORD | PostgreSQL 密码 |
| JWT_SECRET | JWT 签名密钥 |
| DOMAIN | 域名 |

## 常用命令

```bash
# 开发
cd frontend && npm run dev        # 前端 dev server
cd backend && npm run dev         # 后端 dev server

# 测试
cd frontend && npx vitest run     # 前端测试
cd backend && npm test            # 后端测试

# 构建
cd frontend && npm run build      # 前端构建
cd backend && npm run build       # 后端构建

# Docker 生产
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml logs -f backend

# 部署日志
# GitHub Actions → 仓库 → Actions 标签 → 查看流水线日志
```

## 4 天推进记录

### Day 1: 前端 UI
- React 18 + Vite + Tailwind CSS + React Router
- 8 个页面：书架、添加、详情、编辑、分类、统计、设置
- Zustand 状态管理 + 本地存储持久化

### Day 2: 后端 API
- Express 5 + Prisma + SQLite
- JWT 认证 + 密码加密
- REST API：Book/Category/Review/Auth/Stats
- Jest 测试 12/12 通过

### Day 3: 前后端集成
- Axios API 客户端 + React Query
- 认证 Store + 登录/注册页面 + 路由守卫
- 10 个页面全部对接后端 API
- 10/10 测试通过

### Day 4: 生产部署
- Docker 多阶段构建（前后端）
- Docker Compose 生产编排（PostgreSQL）
- GitHub Actions CI/CD（SSH 部署）
- Nginx 反向代理 + SSL 配置
- 部署文档

## 开发约定

### 分支策略
```
main ────────────────── 生产分支
  ├── feat/day1-frontend
  ├── feat/day2-backend
  ├── feat/day3-integration
  └── feat/day4-deploy
```

### 提交规范
```
feat: 新功能
fix: 修复
ci: CI/CD 配置
docs: 文档
```

## 安全

- `.env.production` 不提交到 Git
- SSH 密钥不提交到 Git
- GitHub Secrets 存储敏感信息
- 生产环境 CORS 限制来源域名
- JWT 使用 32+ 字符随机密钥

## 许可证
MIT
