#!/bin/bash
set -euo pipefail

# BookNest PostgreSQL 备份脚本
# 使用: ./backup-db.sh

BACKUP_DIR="${BACKUP_DIR:-/home/deploy/backups/postgres}"
DAYS_TO_KEEP="${DAYS_TO_KEEP:-7}"
DATE=$(date +%Y%m%d_%H%M%S)

# 支持的环境变量覆盖
DB_USER="${DB_USER:-booknest}"
DB_NAME="${DB_NAME:-booknest}"
CONTAINER_NAME="${CONTAINER_NAME:-booknest-postgres-1}"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# 执行备份（通过 Docker exec）
docker exec "$CONTAINER_NAME" pg_dump \
  -U "$DB_USER" \
  -F c \
  -f "/tmp/backup_${DATE}.dump" \
  "$DB_NAME"

# 从容器中复制出来
docker cp "$CONTAINER_NAME:/tmp/backup_${DATE}.dump" \
  "$BACKUP_DIR/backup_${DATE}.dump"

# 清理容器内的临时文件
docker exec "$CONTAINER_NAME" rm -f "/tmp/backup_${DATE}.dump"

# 设置权限
chmod 600 "$BACKUP_DIR/backup_${DATE}.dump"

# 删除过期备份
find "$BACKUP_DIR" -name "backup_*.dump" -mtime +$DAYS_TO_KEEP -delete

# 记录日志
BACKUP_SIZE=$(du -h "$BACKUP_DIR/backup_${DATE}.dump" 2>/dev/null | cut -f1 || echo "unknown")
LOG_LINE="[$(date)] Backup: backup_${DATE}.dump | Size: $BACKUP_SIZE | Kept: ${DAYS_TO_KEEP} days"
echo "$LOG_LINE"
echo "$LOG_LINE" >> /home/deploy/backups/backup.log

echo "[$(date)] Backup completed."
