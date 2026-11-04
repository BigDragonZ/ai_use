# 站点导航与首页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 ai_use 仓库变成一个带统一导航的纯静态学习站点：共享样式与导航、Superpowers 页面迁入主题目录、首页展示六阶段进度、链接检查工具、规范沉淀。

**Architecture:** 纯静态 HTML/CSS/JS，无构建工具。导航数据在 `assets/site.js` 的 JS 对象中，页面通过 `<link>` + `<script>` 两行继承；`tools/check_links.py` 作为全站验证手段。

**Tech Stack:** HTML5、CSS3、原生 JS、Python 3（标准库 html.parser）。

**Spec:** docs/superpowers/specs/2026-11-04-site-structure-design.md

## Global Constraints

- 不引入任何构建工具、框架或外部 CDN；file:// 协议直接打开必须正常
- 全站统一深色风格（沿用 superpowers 页面的配色：背景 #0b0e14、强调色 #7c5cff / #00d4ff）
- 页面语言：中文
- 每个任务完成后单独 commit

## Review Focus

1. file:// 下相对路径失效 —— 深层页面（topics/ai-coding/superpowers/）引用 assets 必须用正确的 `../../../` 相对前缀；由 Task 2 的链接检查覆盖
2. 导航数据与真实目录不同步 —— site.js 中每个链接必须有对应文件；由 Task 4 的全站链接检查覆盖
3. 旧目录 superpowers-guide/ 残留导致两套页面 —— Task 3 必须删除旧目录并验证
4. JS 语法错误导致导航静默不渲染 —— 每个含 JS 的任务用 `node --check` 验证
5. 中文文件名/路径在 href 中未转义 —— 链接检查工具需用 urllib.parse.unquote 后比对

---

### Task 1: 链接检查工具（先行，作为全站的"测试"）

**Files:**
- Create: `tools/check_links.py`

**Interfaces:**
- Produces: 命令 `python3 tools/check_links.py`，扫描所有 `.html` 文件的本地 href/src，有坏链时退出码 1 并逐条打印，全部有效时打印 `OK: N links checked` 且退出码 0。供 Task 2-4 的验证步骤调用。

- [ ] **Step 1: 编写 tools/check_links.py**

用 `html.parser.HTMLParser` 收集 `<a href>`、`<link href>`、`<script src>`；跳过 `http(s):`、`#`、`mailto:` 开头；对剩余链接 `urllib.parse.unquote` 后按页面所在目录解析相对路径，检查文件存在。

- [ ] **Step 2: 运行，确认当前仓库通过（现状基线）**

Run: `python3 tools/check_links.py`
Expected: 退出码 0（现有 superpowers-guide/index.html 无外部本地引用）

- [ ] **Step 3: Commit**

```bash
git add tools/check_links.py
git commit -m "tools: add site-wide link checker"
```

### Task 2: 共享样式与导航（assets/site.css + assets/site.js）

**Files:**
- Create: `assets/site.css`
- Create: `assets/site.js`

**Interfaces:**
- Produces: `assets/site.js` 暴露导航数据 `SITE_NAV`（数组：首页 + 六个阶段，每阶段含 slug、中文名、状态、主题列表）并在 DOMContentLoaded 时向 `body` 前注入顶栏 `<header class="site-nav">`；页面只需 `<link rel="stylesheet" href="<prefix>/assets/site.css">` 和 `<script src="<prefix>/assets/site.js"></script>`，并在 body 加 `class="site-page"`。

- [ ] **Step 1: 编写 assets/site.css**

深色主题变量（--bg:#0b0e14、--accent:#7c5cff、--accent2:#00d4ff），`.site-nav` 顶栏样式（吸顶、阶段下拉菜单、当前页高亮）、`.site-page` 主体宽度微调。不改写页面自有样式的其余部分。

- [ ] **Step 2: 编写 assets/site.js**

`SITE_NAV` 含六阶段：prompt-engineering（提示词工程）、ai-coding（AI 编程助手）、agent（Agent）、rag（RAG）、multimodal（多模态）、automation（自动化）。ai-coding 阶段的主题列表含 `{ title: "Superpowers 完全指南", href: "topics/ai-coding/superpowers/index.html" }`，其余阶段主题为空数组、状态"未开始"。注入逻辑用相对根路径计算：从 `location.pathname` 推导站点根前缀。

- [ ] **Step 3: 验证 JS 语法**

Run: `node --check assets/site.js`
Expected: 无输出，退出码 0

- [ ] **Step 4: Commit**

```bash
git add assets/
git commit -m "site: shared stylesheet and auto-injected navigation"
```

### Task 3: 迁移 Superpowers 页面并接入导航

**Files:**
- Create: `topics/ai-coding/superpowers/index.html`（由 superpowers-guide/index.html 移动改造）
- Delete: `superpowers-guide/index.html`（及空目录）

**Interfaces:**
- Consumes: Task 2 的 assets 引用方式（prefix 为 `../../../`）
- Produces: 站点第一个主题页面，作为后续页面的参照

- [ ] **Step 1: 移动文件**

Run: `mkdir -p topics/ai-coding/superpowers && git mv superpowers-guide/index.html topics/ai-coding/superpowers/index.html`
Expected: 文件出现在新位置

- [ ] **Step 2: 改造页面**

在 `<head>` 加 `<link rel="stylesheet" href="../../../assets/site.css">` 和 `<script src="../../../assets/site.js"></script>`；给 `<body>` 加 `class="site-page"`；给页面主容器加顶部留白避免被吸顶导航遮挡。

- [ ] **Step 3: 全站链接检查**

Run: `python3 tools/check_links.py`
Expected: `OK`，退出码 0

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "site: move superpowers guide into topics/ai-coding, wire shared nav"
```

### Task 4: 首页 index.html

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: Task 2 的 assets（prefix 为 `./`）、Task 3 的主题页面链接

- [ ] **Step 1: 编写首页**

内容：站点标题与简介（来自 README 的定位）；六阶段进度卡片（与 roadmap.md 的状态表一致，ai-coding 标记"进行中"、含 Superpowers 主题链接，其余"未开始"）；学习方式五步闭环简介；复习清单入口占位。引用 `./assets/site.css` 与 `./assets/site.js`，body 加 `class="site-page"`。

- [ ] **Step 2: 全站链接检查**

Run: `python3 tools/check_links.py`
Expected: `OK`，退出码 0

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "site: homepage with roadmap progress cards"
```

### Task 5: 规范沉淀（conventions + README + 页面模板）

**Files:**
- Modify: `docs/conventions.md`（文末新增「站点页面规范」一节）
- Modify: `README.md`（当前进度勾选站点骨架、目录结构补 topics/ 与 assets/）
- Create: `templates/page-template.html`

**Interfaces:**
- Produces: 以后生成新主题页面的固定流程：复制模板 → 改 prefix → 在 site.js 的对应阶段注册主题 → 跑 check_links.py

- [ ] **Step 1: conventions.md 新增「站点页面规范」**

写明：页面位置 `topics/<阶段slug>/<主题slug>/index.html`；必须引用共享 assets 且 body 带 `site-page`；必须在 `assets/site.js` 的对应阶段注册；完成后必须跑 `python3 tools/check_links.py`；新页面同时更新首页对应阶段卡片。

- [ ] **Step 2: 编写 templates/page-template.html**

最小可用页面骨架：两行 assets 引用（prefix 占位注释）、body.site-page、内容区占位。

- [ ] **Step 3: 更新 README.md**

进度勾选「站点骨架（首页+导航）」、目录结构加入 `assets/`、`topics/`、`tools/`。

- [ ] **Step 4: 验证**

Run: `python3 tools/check_links.py && grep -c "站点页面规范" docs/conventions.md`
Expected: 链接检查 OK；grep 输出 ≥ 1

- [ ] **Step 5: Commit**

```bash
git add docs/conventions.md README.md templates/page-template.html
git commit -m "docs: site page conventions and page template"
```
