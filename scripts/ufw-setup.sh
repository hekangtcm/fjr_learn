# BookNest UFW 防火墙配置脚本
# 使用方式: 在服务器上执行此脚本
# bash scripts/ufw-setup.sh

echo "=== Setting up UFW Firewall ==="

# 重置防火墙（清除所有规则）
echo "Resetting UFW..."
sudo ufw --force reset

# 默认策略: 拒绝入站，允许出站
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 允许 SSH (22) — 替换为你的 IP
# sudo ufw allow from YOUR_IP to any port 22
# 或者允许所有（学习阶段，上线后应限制）
sudo ufw allow 22/tcp

# 允许 HTTP (80) 和 HTTPS (443)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用 UFW
sudo ufw --force enable

# 显示状态
echo ""
echo "=== UFW Status ==="
sudo ufw status verbose

echo ""
echo "=== Done ==="
echo "⚠️  注意: 当前 SSH (22) 对所有 IP 开放。"
echo "上线后建议: sudo ufw delete allow 22/tcp"
echo "然后: sudo ufw allow from YOUR_IP to any port 22"
