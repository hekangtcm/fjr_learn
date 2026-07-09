# Package Strategy

## Goals

- 主包只保留启动必需能力。
- 书籍、订单分业务分包。
- 支付和内容安全不污染主包。
- 所有分包跳转路径可维护。

## Package Map

| Package | Pages | Why |
|---|---|---|
| main | index / login / me / categories | 启动入口、TabBar |
| sub/books | detail / form | 高频书籍操作，非启动必需 |
| sub/orders | result | 支付链路、订单结果 |

## Budgets

| Package | Budget | Current | Action |
|---|---:|---:|---|
| main | <= 1.5MB | ~400KB | 已瘦身，后续继续控制 |
| books | <= 1.5MB | ~50KB | 可控 |
| orders | <= 1.5MB | ~20KB | 可控 |

## Preload Rules

| 当前页面 | 预加载 | 原因 |
|---|---|---|
| 首页 | sub/books | 用户大概率点击书籍详情 |

## 路由修正

所有旧路径已统一替换为分包路径：

```
/pages/books/detail/index  → /sub/books/pages/detail/index
/pages/books/form/index    → /sub/books/pages/form/index
/pages/orders/result/index → /sub/orders/pages/result/index
```
