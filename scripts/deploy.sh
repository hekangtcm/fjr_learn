#!/bin/bash
# BookNest 后端部署脚本

set -e

SERVER="deploy@47.103.214.67"
REMOTE_DIR="/home/deploy/booknest"
LOCAL_DIR="/Users/fjr/Desktop/项目/fjr_learn/booknest"
ARCHIVE="booknest-backend-$(date +%Y%m%d_%H%M%S).tar.gz"

echo "=== BookNest 后端部署 ==="
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "服务器: $SERVER"
echo ""

cd "$LOCAL_DIR"

echo "[1/5] 打包后端代码..."
tar czf "/tmp/$ARCHIVE" \
  backend/src/ \
  backend/prisma/ \
  backend/package.json \
  backend/package-lock.json \
  backend/tsconfig.json \
  backend/.env.example \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='*.log' \
  2>/dev/null

echo "[2/5] 上传到阿里云..."
scp -o ConnectTimeout=10 "/tmp/$ARCHIVE" "$SERVER:$REMOTE_DIR/"

echo "[3/5] 远程部署..."
ssh -o ConnectTimeout=10 "$SERVER" << REMOTE
  set -e
  cd "$REMOTE_DIR"
  
  # 备份当前版本
  if [ -d backend ]; then
    cp -r backend backend-backup-$(date +%Y%m%d_%H%M%S)
  fi
  
  # 解压新代码
  tar xzf "$ARCHIVE"
  
  # 安装依赖
  cd backend
  npm install --production
  
  # 生成 Prisma Client
  npx prisma generate
  
  # 同步数据库（如有新模型）
  npx prisma db push --accept-data-loss
  
  # 重启服务
  pm2 restart all || pm2 start dist/server.js --name booknest-backend
  
  sleep 3
  
  # 健康检查
  curl -f http://localhost:4000/health && echo "部署成功！"
REMOTE

echo "[4/5] 清理本地临时文件..."
rm -f "/tmp/$ARCHIVE"

echo "[5/5] 验证外网访问..."
sleep 5
curl -s -o /dev/null -w "Health: HTTP %{http_code} | %{time_total}s\n" http://47.103.214.67/health

echo ""
echo "=== 部署完成 ==="
