# Rollback Plan

> 回滚计划：小程序或后端出现问题时，快速恢复服务的操作手册。

## 小程序回滚

### 场景 1：新版本审核通过但正式发布后出现严重问题

1. 登录微信公众平台 → 版本管理。
2. 找到上一个稳定版本（如 0.0.9）。
3. 点击「回退」→ 确认回退到该版本。
4. 回退后所有用户立即生效，无需重新审核。

### 场景 2：当前版本正在审核中，需要撤回

1. 登录微信公众平台 → 版本管理 → 审核版本。
2. 找到待审核版本，点击「撤回审核」。
3. 修改问题后重新提交。

### 场景 3：只是后端接口问题，小程序本身无问题

1. **不要回滚小程序版本**（避免频繁提交版本号）。
2. 优先回滚后端（见「后端回滚」）。
3. 后端恢复后，小程序自动恢复正常。

### 版本记录

| 版本 | Commit | 状态 | 回滚目标 |
|---|---|---|---|
| 0.1.0 | Day 18 | 当前开发版 | 0.0.9（如有） |

## 后端回滚

### 场景 1：代码问题导致 API 异常

1. GitHub Actions 回滚到上一个稳定 commit：
   ```bash
   git revert <bad-commit>
   # 或
   git checkout <stable-commit>
   ```
2. 重新部署：
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

### 场景 2：数据库迁移问题

1. **数据库迁移不可逆时必须提前写 down/补偿脚本**。
2. 回滚前备份数据库：
   ```bash
   pg_dump -h localhost -U booknest booknest > backup_$(date +%Y%m%d_%H%M%S).sql
   ```
3. 执行 down 脚本或手动补偿数据。
4. 回滚代码后重新部署。

### 场景 3：Docker 镜像回滚

1. 保留最近 3 个 Docker 镜像版本：
   ```bash
   docker images booknest/backend --format '{{.Tag}}' | head -5
   ```
2. 回滚到指定版本：
   ```bash
   docker compose -f docker-compose.prod.yml down
   docker tag booknest/backend:<stable-tag> booknest/backend:latest
   docker compose -f docker-compose.prod.yml up -d
   ```

### 支付数据安全

- **支付相关数据禁止直接删除**。
- 只能修正状态（如 Order 从 PAID 改为 REFUNDED）。
- 所有支付操作必须留审计日志（AuditLog）。
- 退款操作需人工确认，不可自动回滚。

## 紧急关闭开关

| 环境变量 | 用途 | 设置方式 |
|---|---|---|
| `WECHAT_PAY_ENABLED=false` | 暂停真实支付，降级为 mock | 修改 `.env` + `pm2 restart` |
| `CONTENT_SECURITY_STRICT=false` | 降级内容安全策略（降低误杀） | 修改 `.env` + `pm2 restart` |
| `SUBSCRIBE_MESSAGE_ENABLED=false` | 暂停消息发送 | 修改 `.env` + `pm2 restart` |
| `MINI_MAINTENANCE_MODE=true` | 小程序显示维护提示 | 后端返回特定状态码，前端拦截 |

## 事故记录模板

每次回滚或重大故障后必须填写：

```markdown
- 时间：202X-XX-XX XX:XX
- 影响范围：小程序用户 / 后端 API / 支付功能
- 触发版本：0.1.0 / commit xxxxx
- 发现方式：监控告警 / 用户反馈 / 人工巡检
- 处理动作：回滚小程序 / 回滚后端 / 关闭支付开关
- 恢复时间：XX:XX（从发现到恢复共 XX 分钟）
- 后续改进：
  1. 
  2. 
```

## 回滚决策树

```
发现问题
  ├─ 是小程序问题？
  │   ├─ 是 → 小程序回滚到上一版本
  │   └─ 否 → 继续检查
  ├─ 是后端问题？
  │   ├─ 是 → 后端回滚（代码 / 数据库 / Docker）
  │   └─ 否 → 继续检查
  ├─ 是支付问题？
  │   ├─ 是 → 关闭 WECHAT_PAY_ENABLED，人工介入
  │   └─ 否 → 继续检查
  └─ 其他问题 → 关闭相关开关，人工排查
```
