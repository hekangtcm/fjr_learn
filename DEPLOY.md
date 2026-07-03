# BookNest 生产部署指南

## 架构

```
用户 → Nginx (:80) → 前端容器 (:8080) → React SPA
              ↓
         后端容器 (:4000) → Express API
              ↓
         PostgreSQL 容器 (Docker 内网)
```

## 快速开始

### 1. 准备环境变量

在项目根目录创建 `.env`：

```env
DB_USER=booknest
DB_PASSWORD=your-secure-password
DB_NAME=booknest
JWT_SECRET=your-jwt-secret
DOMAIN=your-domain.com
```

### 2. 启动生产服务

```bash
cd booknest
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. 检查服务状态

```bash
docker compose -f docker-compose.prod.yml ps
curl http://localhost:4000/health
curl http://localhost
curl http://localhost/health
```

### 4. 查看日志

```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
```

## 配置 Nginx（宿主机）

如果需要在宿主机上运行 Nginx 作为反向代理：

```bash
sudo cp nginx/booknest.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/booknest.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## GitHub Actions 部署

1. 在 GitHub 仓库 Settings → Secrets 中添加：
   - `DB_PASSWORD`: PostgreSQL 密码
   - `JWT_SECRET`: JWT 签名密钥

2. 配置 Self-hosted Runner：
   - Settings → Actions → Runners → New self-hosted runner
   - 在 ECS 上安装并启动 runner

3. 推送到 main 分支触发自动部署：
   ```bash
   git push origin main
   ```

## 手动部署（无 CI/CD）

```bash
# 1. 克隆代码
git clone https://github.com/your-repo/booknest.git
cd booknest

# 2. 创建 .env
cat > .env <<EOF
DB_USER=booknest
DB_PASSWORD=your-password
DB_NAME=booknest
JWT_SECRET=your-secret
DOMAIN=your-domain.com
EOF

# 3. 构建并启动
docker compose -f docker-compose.prod.yml up -d --build

# 4. 健康检查
for i in {1..30}; do
  curl -f http://localhost:4000/health && echo "Backend OK" && break
  sleep 2
done
```

## 端口说明

| 服务 | 容器端口 | 宿主机端口 | 用途 |
|------|---------|-----------|------|
| PostgreSQL | 5432 | 不暴露 | 数据库内部通信 |
| Backend | 4000 | 4000 | API 接口 |
| Frontend | 80 | 8080 | 静态网站 |
| Nginx | 80/443 | 80/443 | 反向代理入口 |

## 常见问题

### 数据库连接失败
- 检查 PostgreSQL 容器是否健康：`docker compose ps`
- 检查 `DATABASE_URL` 环境变量是否正确
- 检查 `DB_PASSWORD` 是否包含特殊字符需要转义

### 前端无法访问 API
- 检查 `VITE_API_URL` 是否为 `/api/v1`（生产环境用相对路径）
- 检查 Nginx 是否正确配置了 `/api/` 反向代理
- 检查后端服务是否运行：`curl http://localhost:4000/health`

### 部署后没有数据
- 生产环境使用独立的 PostgreSQL 容器，与开发 SQLite 数据不共享
- 需要重新注册账号并添加数据
- 或使用 `prisma:seed` 脚本注入初始数据
