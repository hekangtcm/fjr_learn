# HTTPS 配置指南

> BookNest 生产环境 HTTPS 配置步骤。当前服务器使用 IP 地址，需绑定域名后才能配置 SSL。

## 前提条件

1. **已备案域名**（中国大陆服务器必需）
2. **域名解析到服务器 IP** `47.103.214.67`
3. **服务器开放 443 端口**（阿里云安全组）

## 配置步骤

### 1. 域名购买与备案

```bash
# 在阿里云购买域名（如 booknest.com）
# 完成 ICP 备案（约 7-20 个工作日）
```

### 2. DNS 解析

```
A 记录: booknest.com → 47.103.214.67
A 记录: www.booknest.com → 47.103.214.67
```

### 3. 开放 443 端口

```bash
# 阿里云安全组 → 入方向规则 → 添加 TCP 443
# 同时确保 80 端口开放（Let's Encrypt 验证需要）
```

### 4. 安装 Certbot 并申请证书

```bash
# 安装 snapd 和 certbot
apt-get update
apt-get install -y snapd
snap install core && snap refresh core
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot

# 申请证书（需要域名已解析到服务器）
certbot --nginx -d booknest.com -d www.booknest.com

# 自动续期测试
certbot renew --dry-run
```

### 5. Nginx HTTPS 配置

替换 `/etc/nginx/conf.d/booknest.conf`：

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name booknest.com www.booknest.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name booknest.com www.booknest.com;

    # SSL 证书（Certbot 自动配置）
    ssl_certificate /etc/letsencrypt/live/booknest.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/booknest.com/privkey.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HSTS（已由 Helmet 设置，Nginx 可补充）
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript;

    # 静态文件
    location = /robots.txt {
        root /var/www/booknest;
        try_files /robots.txt =404;
        access_log off;
    }

    location = /sitemap.xml {
        root /var/www/booknest;
        try_files /sitemap.xml =404;
        access_log off;
    }

    location = /app.js {
        return 404;
    }

    # 前端 SPA
    location / {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_hide_header Content-Disposition;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
        add_header Expect-CT "max-age=86400, enforce" always;
    }

    # 静态资源缓存
    location ~* \.(?:css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:4001;
        expires 1y;
        add_header Cache-Control "public, immutable" always;
        proxy_hide_header Content-Disposition;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
        add_header Expect-CT "max-age=86400, enforce" always;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
        add_header Expect-CT "max-age=86400, enforce" always;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
        add_header Expect-CT "max-age=86400, enforce" always;
    }

    # 上传文件
    location /uploads/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
        add_header Expect-CT "max-age=86400, enforce" always;
    }
}
```

### 6. 后端 CORS 更新

```typescript
// server.ts
const allowedOrigins = [
  'https://booknest.com',
  'https://www.booknest.com',
  // ...开发环境
]
```

### 7. 小程序合法域名配置

登录微信公众平台 → 开发管理 → 开发设置：

| 域名类型 | 填写 |
|---|---|
| request 合法域名 | `https://booknest.com` |
| uploadFile 合法域名 | `https://booknest.com` |
| downloadFile 合法域名 | `https://booknest.com` |

### 8. 测试

```bash
# 检查 HTTPS
curl -I https://booknest.com/health
# → HTTP/2 200

# 检查证书
echo | openssl s_client -connect booknest.com:443 2>/dev/null | openssl x509 -noout -dates
# → notBefore=... notAfter=...

# 检查 HSTS
curl -I https://booknest.com/ | grep -i strict-transport
# → Strict-Transport-Security: max-age=63072000
```

## 当前状态

| 项目 | 状态 |
|---|---|
| 域名 | ❌ 未配置（当前使用 IP: 47.103.214.67） |
| SSL 证书 | ❌ 未配置 |
| HTTPS | ❌ 未启用 |
| HTTP/2 | ❌ 需要 HTTPS |
| 备案 | ❌ 需要域名 |

## 下一步

1. 购买域名（推荐阿里云 `.com` 或 `.cn`）
2. 完成 ICP 备案
3. DNS 解析到 `47.103.214.67`
4. 运行上述 Certbot 命令自动配置

---

> **注意**：微信小程序正式版要求 HTTPS + 已备案域名。当前 IP 地址仅用于开发/测试阶段。
