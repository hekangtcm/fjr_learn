# Performance Report

## Baseline

| 指标 | 优化前 | 优化后 | 说明 |
|---|---:|---:|---|
| 总包体积 | 504K | 504K | 分包后总大小不变，但主包已瘦身 |
| 主包 JS | ~380K | ~380K | app.js + taro.js + vendors.js |
| 分包 books | — | ~50K | sub/books 独立分包 |
| 分包 orders | — | ~20K | sub/orders 独立分包 |
| 首页首屏请求数 | 3-4 | 3-4 | workspace + books + categories |
| 图片优化 | 无 | lazyLoad + 缩略图 | BookCard 和首页列表已启用 |

## Optimizations Applied

### 1. SubPackages
- books/detail, books/form 移入 sub/books
- orders/result 移入 sub/orders
- 首页配置 preloadRule 预加载 sub/books

### 2. Image Optimization
- BookCard 使用 `getCoverThumbUrl` 生成 OSS 缩略图
- 首页列表封面使用 `lazyLoad`
- 封面详情页使用原图或 `getCoverDetailUrl`

### 3. Component Optimization
- BookCard 使用 `React.memo` 减少无效渲染
- 首页搜索使用 `useCallback` 避免重复创建函数

### 4. Platform Adapter
- `src/platform/index.ts` 提供 `isWeapp()` / `isH5()`
- 平台差异集中管理，不散落在页面里

## Next Steps

- 真实 OSS 接入后验证缩略图参数收益
- 列表超过 100 条时引入虚拟列表
- 实验 CompileMode 对长列表 item 的优化
