# 站点结构与导航设计（简版）

> 日期：2026-11-04 ｜ 状态：已批准

## 意图与原因

`ai_use` 是个人 AI 学习知识站点。每轮对话学习结束后生成的页面必须自动挂入
统一导航，与已有内容形成整体，而不是孤立的 HTML 文件。

## 目标

- 首页展示项目介绍与六阶段学习路线图的进度
- 所有站点页面共享统一导航与样式
- 新增「站点页面规范」，使以后每次生成页面自动遵守
- 把已有的 Superpowers 学习页归入阶段二「AI 编程助手」

## 非目标

- 不引入静态站点生成器或任何构建工具（纯 HTML/CSS/JS，双击即可打开）
- 不做部署
- 不为路线图的其他阶段预建空页面（只有占位卡片）

## 方案选择

| 方案 | 取舍 | 结论 |
|------|------|------|
| A. 纯静态 + 共享 assets（site.css / site.js） | 零依赖、file:// 直接可用；新增页面需手动加两行引用 | ✅ 选用 |
| B. 静态站点生成器（VitePress 等） | 导航自动生成，但引入 Node 构建链，违背"无构建工具"约束 | 排除 |
| C. 每页复制粘贴导航 HTML | 无共享文件，但改导航要改所有页面，不可维护 | 排除 |

导航数据放在 `assets/site.js` 的 JS 对象里（不用 fetch 读 JSON，避免 file://
协议下的跨域限制），每个页面用两行引用即可继承导航。

## 结构

```
.
├── index.html                     # 首页：介绍 + 六阶段进度 + 导航
├── assets/
│   ├── site.css                   # 全站共享样式
│   └── site.js                    # 导航数据 + 顶栏注入
├── topics/
│   └── <阶段slug>/<主题slug>/index.html   # 每个主题一个目录
│       └── ai-coding/superpowers/index.html（从 superpowers-guide/ 迁入）
├── tools/
│   └── check_links.py             # 站内链接检查
└── templates/
    └── page-template.html         # 新页面模板（两行引用继承导航）
```

## 已定事项

- 主题页面目录：`topics/<阶段slug>/<主题slug>/`，阶段 slug 取自路线图
- Superpowers 页面归入 `topics/ai-coding/superpowers/`
- 规范沉淀位置：`docs/conventions.md` 新增「站点页面规范」一节

## 留给实施者的

- 具体配色与排版细节（沿用 Superpowers 页面的深色风格，全站统一）
- 首页卡片的文案措辞
