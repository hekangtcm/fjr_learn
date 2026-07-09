# BookNest Mini Pro - 测试指南

> 本文档说明如何全面测试 BookNest Mini Pro 项目是否跑通。

## 测试环境

- **后端**: 阿里云 ECS `47.103.214.67` (HTTP)
- **小程序**: Taro 4.0.9 + React + TypeScript
- **构建环境**: Node.js v20+（推荐 v20.20.2，Taro 构建不支持 v24）
- **测试时间**: 2026-07-09

---

## 一、后端 API 在线测试

### 1.1 健康检查

```bash
curl http://47.103.214.67/health
# 期望: HTTP 200
```

### 1.2 关键 API 端点

| 端点 | 期望状态 | 说明 |
|---|---|---|
| `GET /health` | 200 | 后端健康检查 |
| `GET /api/v1/books` | 401 | 需要 JWT 认证（路由正常） |
| `GET /api/v1/auth/me` | 401 | 认证中间件正常 |
| `GET /api/v1/categories` | 401 | 路由正常 |

### 1.3 带认证的 API 测试

使用已登录用户的 JWT token：

```bash
TOKEN="your-jwt-token-here"

curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Workspace-Id: your-workspace-id" \
     http://47.103.214.67/api/v1/books
# 期望: HTTP 200 + JSON 书籍列表
```

---

## 二、Taro 构建测试

### 2.1 环境准备

**重要**: Taro 4.0.9 构建需要 Node.js v20，不兼容 v24。

```bash
# 检查当前 Node 版本
node --version

# 如果显示 v24.x，切换到 v20
nvm use 20
# 或
fnm use 20
```

### 2.2 构建命令

```bash
cd apps/mini-taro

# 安装依赖（如未安装）
pnpm install

# 类型检查
pnpm typecheck
# 或: tsc --noEmit

# 构建微信小程序
pnpm build:weapp
# 或: taro build --type weapp
```

### 2.3 构建成功标准

构建成功后会生成 `dist/` 目录，包含以下文件：

```
dist/
├── app.js              # 主包逻辑 (~107KB)
├── app.json            # 页面配置
├── app.wxss            # 全局样式
├── pages/              # 主包页面（4 个 TabBar）
│   ├── index/
│   ├── categories/
│   ├── me/
│   └── login/
├── sub/                # 分包
│   ├── books/          # 图书分包
│   │   └── pages/
│   │       ├── detail/
│   │       └── form/
│   └── orders/         # 订单分包
│       └── pages/
│           └── result/
└── project.config.json # 项目配置
```

### 2.4 常见构建问题

| 问题 | 原因 | 解决 |
|---|---|---|
| `webpackbar` 类型错误 | Node.js v24 不兼容 | 切换到 Node v20 |
| `Cannot find module '@tarojs/webpack5-runner'` | 依赖未安装 | `pnpm install` |
| 类型检查失败 | TypeScript 错误 | 检查 `src/` 下的类型错误 |

---

## 三、小程序端测试（微信开发者工具）

### 3.1 导入项目

1. 打开 **微信开发者工具**
2. 点击「导入项目」
3. 选择目录：`booknest/apps/mini-taro/dist`
4. AppID：填写你的小程序 AppID（或测试号）
5. 点击「导入」

### 3.2 基础测试

| 测试项 | 步骤 | 期望结果 |
|---|---|---|
| 页面加载 | 打开首页 | 显示书籍列表，不白屏 |
| 分包加载 | 点击书籍卡片进入详情 | 加载 `sub/books` 分包，页面正常展示 |
| 图片加载 | 首页查看书籍封面 | 封面图片正常显示（使用懒加载 + 缩略图） |
| 下拉刷新 | 首页下拉 | 刷新书籍列表，loading 正常 |

### 3.3 用户路径测试

#### 3.3.1 微信登录

1. 点击「登录」按钮
2. 授权微信登录
3. 检查：
   - 后端返回 JWT token
   - 本地存储 `booknest_token`
   - 用户信息显示在「我的」页

#### 3.3.2 Workspace 切换

1. 进入「我的」页
2. 点击当前 Workspace
3. 选择另一个 Workspace
4. 检查：
   - 首页数据刷新为新 Workspace 的书籍
   - `X-Workspace-Id` 请求头正确

#### 3.3.3 创建书籍

1. 点击「卖书」Tab
2. 填写书名、作者、价格、分类
3. 上传封面（调用 `uploadFile`）
4. 保存
5. 检查：
   - 书籍出现在首页列表
   - 封面图片正常显示
   - 数据库有记录

#### 3.3.4 支付流程（Mock 模式）

1. 选择书籍 → 创建订单
2. 确认支付（Mock 模式）
3. 检查：
   - 订单状态变为 `PAID`
   - 生成 Ticket（状态 `VALID`）
   - 支付结果页正常展示

### 3.4 权限测试

| 角色 | 操作 | 期望结果 |
|---|---|---|
| VIEWER | 创建书籍 | 403 禁止 |
| MEMBER | 管理成员 | 403 禁止 |
| ADMIN | 审核内容安全 | 200 成功 |
| 非成员 | 访问 Workspace | 403 禁止 |

---

## 四、自动化测试脚本

### 4.1 运行测试

```bash
cd apps/mini-taro
bash scripts/e2e-test.sh
```

### 4.2 测试输出示例

```
========================================
  BookNest Mini Pro - E2E Test Suite
  2026-07-09 21:53:50 CST
  API: http://47.103.214.67/api/v1
========================================

[1/4] Backend Health Check
✓ Root health (HTTP 200)
✓ API books (auth required) (HTTP 401)
✓ API auth me (auth required) (HTTP 401)
✓ API categories (HTTP 401)

[2/4] Nginx / Static Assets
✓ Nginx root (HTTP 200)

[3/4] Taro Build Check
✓ dist/ directory exists
✓ dist/app.js exists (105K)
✓ dist/sub/ exists (subpackage output)
✓ sub/books/detail/index.js exists
✓ sub/orders/result/index.js exists

[4/4] Source Files Check
✓ src/app.config.ts exists
✓ src/config/env.ts exists
✓ src/services/request.ts exists
...

========================================
  Results: PASS=15 FAIL=0
========================================
```

---

## 五、生产环境检查清单

提交审核前必须确认：

- [ ] 后端 API 使用 HTTPS 域名（已备案）
- [ ] request 合法域名已配置（微信公众平台）
- [ ] uploadFile 合法域名已配置（OSS 地址）
- [ ] downloadFile 合法域名已配置（OSS 图片地址）
- [ ] 生产环境关闭 mock callback（`/wechat-pay/mock-callback` 返回 403）
- [ ] 主包体积 < 2MB
- [ ] 分包结构正确
- [ ] 无测试文案、调试按钮暴露

---

## 六、故障排查

### 后端不通

```bash
# 检查后端是否运行
curl http://47.103.214.67/health
# 如果超时，检查 PM2 状态：
# ssh 到服务器后: pm2 status
```

### 构建失败

```bash
# 1. 检查 Node 版本
node --version  # 必须是 v20.x

# 2. 清理缓存重新构建
rm -rf dist node_modules/.cache
pnpm install
pnpm build:weapp

# 3. 如果 webpackbar 报错，手动修复
# 编辑 node_modules/@tarojs/webpack5-runner/dist/webpack/BaseConfig.js
# 删除 webpackbar 相关代码
```

### 小程序无法调用 API

1. 检查开发者工具 → 详情 → 本地设置 → 「不校验合法域名」是否勾选（开发时）
2. 检查微信公众平台 → 开发管理 → 开发设置 → request 合法域名
3. 检查 `env.ts` 中的 API 地址是否正确

### 登录失败

1. 检查后端 `code2Session` 配置（AppID + AppSecret）
2. 检查微信开发者工具登录的账号是否有小程序权限
3. 检查后端日志：`pm2 logs`
