#!/bin/bash
# BookNest 安全巡检脚本
# 使用: ./security-check.sh

echo "=============================================="
echo "  BookNest Security Check"
echo "=============================================="
echo ""

PASS=0
FAIL=0

check() {
  local name="$1"
  local status="$2"
  if [ "$status" = "0" ]; then
    echo "  ✅ $name"
    ((PASS++))
  else
    echo "  ❌ $name"
    ((FAIL++))
  fi
}

# 1. SSH 安全
echo "[1/8] SSH Security"
if [ -f /etc/ssh/sshd_config ]; then
  grep -q "^PermitRootLogin no" /etc/ssh/sshd_config 2>/dev/null && check "Root login disabled" 0 || check "Root login disabled" 1
  grep -q "^PasswordAuthentication no" /etc/ssh/sshd_config 2>/dev/null && check "Password auth disabled" 0 || check "Password auth disabled" 1
  grep -q "^PubkeyAuthentication yes" /etc/ssh/sshd_config 2>/dev/null && check "Key auth enabled" 0 || check "Key auth enabled" 1
else
  echo "  ⚠️  /etc/ssh/sshd_config not found (local run)"
fi
echo ""

# 2. fail2ban
echo "[2/8] Fail2ban"
if command -v systemctl &> /dev/null; then
  systemctl is-active --quiet fail2ban 2>/dev/null && check "fail2ban running" 0 || check "fail2ban running" 1
else
  echo "  ⚠️  systemctl not available (local run)"
fi
echo ""

# 3. 防火墙
echo "[3/8] Firewall"
if command -v ufw &> /dev/null; then
  ufw status | grep -q "Status: active" 2>/dev/null && check "UFW active" 0 || check "UFW active" 1
else
  echo "  ⚠️  ufw not available (local run)"
fi
echo ""

# 4. 自动更新
echo "[4/8] Auto Updates"
if command -v systemctl &> /dev/null; then
  systemctl is-active --quiet unattended-upgrades 2>/dev/null && check "Auto updates running" 0 || check "Auto updates running" 1
else
  echo "  ⚠️  systemctl not available (local run)"
fi
echo ""

# 5. 应用层 — 检查环境变量
echo "[5/8] Application Security"
ENV_FILE="/home/deploy/booknest/.env"
if [ -f "$ENV_FILE" ]; then
  stat -c "%a" "$ENV_FILE" 2>/dev/null | grep -q "600" && check ".env permissions 600" 0 || check ".env permissions 600" 1
else
  echo "  ⚠️  .env not found at $ENV_FILE"
fi
echo ""

# 6. Docker 容器
echo "[6/8] Docker Containers"
if command -v docker &> /dev/null; then
  docker ps --format "{{.Names}}" 2>/dev/null | grep -q "postgres" && check "PostgreSQL container running" 0 || check "PostgreSQL container running" 1
  docker ps --format "{{.Names}}" 2>/dev/null | grep -q "backend" && check "Backend container running" 0 || check "Backend container running" 1
  docker ps --format "{{.Names}}" 2>/dev/null | grep -q "frontend" && check "Frontend container running" 0 || check "Frontend container running" 1
else
  echo "  ⚠️  docker not available (local run)"
fi
echo ""

# 7. 备份检查
echo "[7/8] Backups"
BACKUP_DIR="/home/deploy/backups/postgres"
if [ -d "$BACKUP_DIR" ]; then
  BACKUP_COUNT=$(find "$BACKUP_DIR" -name "*.dump" -mtime -2 2>/dev/null | wc -l)
  [ "$BACKUP_COUNT" -gt 0 ] && check "Recent backup exists ($BACKUP_COUNT)" 0 || check "Recent backup exists" 1
else
  echo "  ⚠️  Backup directory not found at $BACKUP_DIR"
fi
echo ""

# 8. 磁盘空间
echo "[8/8] Disk Space"
if command -v df &> /dev/null; then
  DISK_USAGE=$(df -h / 2>/dev/null | awk 'NR==2 {print $5}' | tr -d '%')
  if [ -n "$DISK_USAGE" ] && [ "$DISK_USAGE" -lt 80 ]; then
    check "Disk usage OK (${DISK_USAGE}%)" 0
  else
    check "Disk usage OK (${DISK_USAGE}%)" 1
  fi
else
  echo "  ⚠️  df not available"
fi
echo ""

# Summary
echo "=============================================="
echo "  Results: $PASS passed, $FAIL failed"
if [ "$FAIL" -eq 0 ]; then
  echo "  ✅ All checks passed!"
else
  echo "  ⚠️  $FAIL items need attention"
fi
echo "=============================================="
