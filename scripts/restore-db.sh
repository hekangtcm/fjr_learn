#!/bin/bash
set -euo pipefail

# BookNest PostgreSQL 恢复脚本
# 使用: ./restore-db.sh <backup_file.dump>

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <backup_file.dump>"
  echo ""
  echo "Available backups:"
  ls -lt /home/deploy/backups/postgres/ 2>/dev/null || echo "  (no backups found)"
  exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="${CONTAINER_NAME:-booknest-postgres-1}"
DB_USER="${DB_USER:-booknest}"
DB_NAME="${DB_NAME:-booknest}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: File not found: $BACKUP_FILE"
  exit 1
fi

echo "=============================================="
echo "WARNING: This will REPLACE the current database!"
echo "Backup file: $BACKUP_FILE"
echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo "=============================================="
echo ""
read -p "Type 'yes' to continue: " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

# 先创建当前数据库的备份（以防万一）
CURRENT_BACKUP="/home/deploy/backups/postgres/pre-restore_$(date +%Y%m%d_%H%M%S).dump"
echo "Creating safety backup: $CURRENT_BACKUP"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -F c -f "/tmp/safety.dump" "$DB_NAME"
docker cp "$CONTAINER_NAME:/tmp/safety.dump" "$CURRENT_BACKUP"
docker exec "$CONTAINER_NAME" rm -f "/tmp/safety.dump"
chmod 600 "$CURRENT_BACKUP"

# 恢复数据
echo "Restoring from: $BACKUP_FILE"
docker cp "$BACKUP_FILE" "$CONTAINER_NAME:/tmp/restore.dump"

docker exec "$CONTAINER_NAME" pg_restore \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --clean \
  --if-exists \
  "/tmp/restore.dump"

# 清理临时文件
docker exec "$CONTAINER_NAME" rm -f "/tmp/restore.dump"

echo "=============================================="
echo "Restore completed from: $BACKUP_FILE"
echo "Safety backup: $CURRENT_BACKUP"
echo "=============================================="
