# Web to Mini Migration Map

## 页面迁移

| Web 页面 | 小程序页面 | 优先级 | 迁移策略 | 状态 |
|---|---|---|---|---|
| `/books` (BookList) | `pages/index/index` | P0 | Taro 重写 UI，复用类型和 mock 数据 | ✅ Done |
| `/books/:id` (BookDetail) | `pages/books/detail/index` | P0 | Taro 重写 UI，复用 detail 数据 | ✅ Done |
| `/books/new` (BookCreate) | `pages/books/form/index` | P0 | 表单重写，校验逻辑复用 | ✅ Done |
| `/categories` (CategoryManager) | `pages/categories/index` | P1 | 移动端简化展示 | ✅ Done |
| `/me` / `/settings` | `pages/me/index` | P1 | 简化个人信息页 | ✅ Done |
| `/login` | `pages/login/index` | P1 | 登录占位页 | ✅ Done |
| `/workspaces` | 分包 workspace | P2 | Day 14 迁移 | Todo |
| `/activities` | 分包 activities | P2 | Day 15 迁移 | Todo |
| `/orders` | 分包 orders | P2 | Day 15 迁移 | Todo |
| `/stats` | 分包 stats | P2 | Day 16 迁移 | Todo |

## 组件迁移

| Web 组件 | 小程序组件 | 是否直接复用 | 说明 |
|---|---|---|---|
| BookCard | BookCard | 否 | JSX 结构可参考，DOM 标签重写为 Taro View/Image/Text | ✅ Done |
| EmptyState | EmptyState | 部分 | 样式重写为 rpx + BEM | ✅ Done |
| LoadingSpinner | 待创建 | 否 | 使用 Taro 加载动画或自定义 | Todo |
| StatusBadge | 已内联到 BookCard | 否 | 直接内联在 BookCard 中显示 | ✅ Done |
| Modal | 待创建 | 否 | 小程序弹层交互不同，需重写 | Todo |
| Toast | Taro.showToast | 否 | 使用平台原生能力 | Todo |

## 状态迁移

| Web 状态 | 小程序状态 | 说明 |
|---|---|---|
| token store (Zustand) | auth store (Zustand) | storage adapter 改为 Taro.setStorageSync | Todo |
| activeWorkspaceId | workspace store | 请求头继续带 X-Workspace-Id | Todo |
| React Query cache | React Query cache | Day 13 接入真实 API 时配置 | Todo |
| useBookStore | useBookStore | Day 13 接入真实数据 | Todo |

## API 迁移

| Web API Client | 小程序适配 | 说明 |
|---|---|---|
| Axios | Taro.request | Day 13 创建 request adapter |
| JWT Header | JWT Header | 从 Taro storage 读取 token |
| X-Workspace-Id | X-Workspace-Id | 继续带 workspace header |

## 样式迁移规则

| Web | 小程序 |
|---|---|
| Tailwind class | 参考设计 token，使用 rpx + BEM class |
| px 单位 | rpx (设计基准 750rpx) |
| flex/grid | flex (小程序 grid 支持有限) |
| fixed bottom | 注意底部安全区 (safe-area-inset-bottom) |
| box-shadow | 简化为单层阴影 |
| border-radius | 保持圆角风格 |

## 目录结构

```
booknest/
├── apps/
│   ├── web/ (原 frontend，暂不迁移)
│   └── mini-taro/          ✅ Taro 小程序
│       ├── src/
│       │   ├── pages/      ✅ 首页、分类、我的、登录、详情、表单
│       │   ├── components/ ✅ BookCard、EmptyState
│       │   ├── mocks/      ✅ mock 书籍、分类、工作区
│       │   ├── stores/     (Day 13 接入)
│       │   ├── hooks/      (Day 13 接入)
│       │   ├── types/      (Day 13 接入)
│       │   └── utils/      (Day 13 接入)
│       ├── config/         ✅ Taro 配置
│       └── package.json    ✅ 依赖配置
├── packages/
│   └── domain/             ✅ 共享领域类型
├── backend/                (继续使用，不迁移)
└── docs/
    └── WEB_TO_MINI_MIGRATION_MAP.md ✅
```

## 技术栈对比

| 功能 | Web | 小程序 |
|---|---|---|
| 框架 | React 18 + Vite | Taro 4 + React |
| 路由 | React Router | Taro 页面栈 |
| 状态管理 | Zustand | Zustand |
| 样式 | Tailwind CSS | SCSS + rpx |
| 组件库 | 自定义 | 自定义 + Taro 组件 |
| 网络 | Axios | Taro.request |
| 存储 | localStorage | Taro storage |
