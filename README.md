# Hugo Sakura Lite

<p align="center">
  <img src="static/images/sakura.svg" alt="Sakura" width="80" />
</p>

<p align="center">
  一个轻量、美观的 Hugo 博客主题
</p>

<p align="center">
  参考 <a href="https://github.com/mashirozx/Sakura">Sakura</a> 绘制，并进行了个人风格的修改和简化
</p>

---

## 功能特性

| 分类 | 功能 | 说明 |
| :--- | :--- | :--- |
| **主题外观** | 深色/浅色模式切换 | 支持跟随系统主题，也可手动切换并保存偏好 |
| | 首页 Hero 横幅 | 全屏封面图展示，支持自定义标题和副标题 |
| | 页面随机横幅 | 支持配置多张横幅图片，自动为不同页面分配 |
| | 响应式设计 | 完美适配移动端和桌面端 |
| | 图片加载动画 | 优雅的 shimmer 加载占位效果 |
| **文章功能** | 文章封面图 | 支持 `cover.image` 或 `banner` 字段设置封面 |
| | 阅读时长 | 自动计算文章阅读时间 |
| | 字数统计 | 显示文章字数 |
| | 分类与标签 | 完整的分类和标签系统 |
| | 上下篇导航 | 文章底部的前后导航 |
| | 目录 (TOC) | 侧边栏目录，支持滚动高亮跟踪 |
| **搜索功能** | 全站搜索 | 基于 JSON 索引的客户端搜索 |
| | 实时搜索 | 输入即搜，无需刷新页面 |
| | 关键词高亮 | 搜索结果中高亮显示匹配关键词 |
| | 快捷键支持 | `Cmd/Ctrl + K` 快速跳转到搜索页面 |
| **代码功能** | 语法高亮 | 集成 highlight.js，支持多种语言 |
| | 代码复制按钮 | 一键复制代码块内容 |
| | Mermaid 图表 | 支持流程图、时序图等 Mermaid 图表渲染 |
| **评论系统** | 后端支持 | 依赖 [comments-worker](https://github.com/love98ooo/comments-worker) 提供后端服务 |
| | 多种登录方式 | 支持 GitHub OAuth 和邮箱验证码登录 |
| | Cloudflare Turnstile | 集成人机验证，防止垃圾评论 |
| **页面模板** | 首页 | `home.html` - 文章列表展示 |
| | 文章页 | `single.html` - 完整文章阅读 |
| | 归档页 | `archives.html` - 时间线样式的文章归档 |
| | 关于页 | `about.html` - 个人介绍页面 |
| | 友链页 | `friends.html` - 友情链接展示 |
| | 搜索页 | `search.html` - 全站搜索 |
| | 分类/标签页 | `taxonomy.html`, `term.html` - 分类和标签列表 |
| **其他特性** | RSS 订阅 | 自动生成 RSS Feed |
| | Open Graph | 完整的 OG 标签支持，优化社交分享 |
| | Twitter Card | 支持 Twitter 卡片预览 |
| | SEO 优化 | 规范的 meta 标签和 canonical 链接 |
| | 移动端菜单 | 响应式汉堡菜单 |
| | 平滑滚动 | 锚点链接平滑滚动 |
| | 键盘快捷键 | 支持 Escape 关闭菜单等 |
| **性能优化** | CSS 按需加载 | 首页仅加载核心样式，文章页按需加载内容样式 |
| | JS 异步加载 | Highlight.js 和 Mermaid.js 仅在文章页异步加载 |

---

## 安装

### 方式一：Git Submodule（推荐）

```bash
cd your-hugo-site
git submodule add https://github.com/love98ooo/Hugo-Sakura-Lite themes/Sakura
```

### 方式二：直接下载

下载主题并解压到 `themes/Sakura` 目录。

---

## 配置

在 `hugo.yaml`（或 `hugo.toml`）中添加以下配置：

```yaml
theme: Sakura

params:
  # 站点描述
  description: "我的个人博客"
  author: "Your Name"

  # 主要内容区域
  mainSections:
    - posts
    - archives

  # Logo（可选，不设置则显示站点标题）
  logo: "/images/logo.png"

  # 首页 Hero 配置
  hero:
    title: "欢迎来到我的博客"
    subtitle: "记录生活，分享技术"
    background: "/images/banner.webp"

  # 页面横幅图片池（随机分配给各页面）
  bannerImages:
    - "/images/banner1.jpg"
    - "/images/banner2.jpg"
    - "/images/banner3.jpg"

  # Open Graph 默认图片
  ogImage: "/images/og-image.jpg"

  # 友链配置
  friends:
    - name: "朋友的博客"
      url: "https://example.com"
      avatar: "https://example.com/avatar.jpg"
      desc: "一个有趣的博客"

  # 后端部署请参考：https://github.com/love98ooo/comments-worker
  # 评论系统配置（可选）
  comments:
    enabled: true
    apiUrl: "https://your-api.example.com"
    turnstileSiteKey: "your-turnstile-site-key"

# 导航菜单
menus:
  main:
    - name: Home
      pageRef: /
      weight: 10
    - name: Archives
      pageRef: /archives
      weight: 20
    - name: Tags
      pageRef: /tags
      weight: 30
    - name: About
      pageRef: /about
      weight: 40
    - name: Friends
      pageRef: /friends
      weight: 50
    - name: Search
      pageRef: /search
      weight: 60
```

---

## 目录结构

``` text
themes/Sakura/
├── archetypes/          # 文章模板
├── assets/
│   ├── css/             # 样式文件
│   │   ├── base.css     # 基础样式、变量定义
│   │   ├── header.css   # 头部样式
│   │   ├── content.css  # 内容区样式
│   │   ├── posts.css    # 文章列表样式
│   │   ├── sections.css # 各页面区块样式
│   │   ├── comments.css # 评论区样式
│   │   ├── toc.css      # 目录样式
│   │   └── components.css # 组件样式
│   └── js/
│       ├── main.js      # 主要 JS 功能
│       ├── toc.js       # 目录滚动跟踪
│       └── comments.js  # 评论系统
├── layouts/
│   ├── baseof.html      # 基础模板
│   ├── home.html        # 首页
│   ├── page.html        # 通用页面
│   ├── section.html     # 区域页面
│   ├── taxonomy.html    # 分类/标签列表
│   ├── term.html        # 分类/标签详情
│   ├── 404.html         # 404 页面
│   ├── _default/
│   │   ├── single.html  # 文章页
│   │   ├── archives.html
│   │   ├── search.html
│   │   ├── about.html
│   │   ├── friends.html
│   │   └── index.json   # 搜索索引
│   └── partials/        # 可复用组件
│       ├── head.html
│       ├── header.html
│       ├── footer.html
│       ├── hero.html
│       ├── menu.html
│       ├── post-card.html
│       ├── page-banner.html
│       ├── toc.html
│       └── comments.html
└── static/
    └── images/
```

---

## 文章 Front Matter

```yaml
---
title: "文章标题"
date: 2025-01-04
description: "文章摘要"
categories:
  - 技术
tags:
  - Hugo
  - 主题

# 封面图片（二选一）
cover:
  image: "/images/post-cover.jpg"
# 或
banner: "/images/post-cover.jpg"

# 禁用评论（可选）
comments: false
---
```

---

## 创建页面

### 归档页

```bash
hugo new archives/_index.md
```

Front matter:

```yaml
---
title: "归档"
layout: "archives"
---
```

### 搜索页

```bash
hugo new search.md
```

Front matter:

```yaml
---
title: "搜索"
layout: "search"
placeholder: "搜索文章..."
---
```

### 友链页

```bash
hugo new friends.md
```

Front matter:

```yaml
---
title: "友情链接"
layout: "friends"
---

这里可以写一些介绍文字...
```

### 关于页

``` bash
hugo new about.md
```


Front matter:

``` yaml
---
title: "关于"
layout: "about"
---

这里介绍自己...
```

---

## 深色模式

主题支持三种深色模式策略：

1. **跟随系统** - 默认行为，根据系统偏好自动切换
2. **手动切换** - 点击头部主题切换按钮
3. **持久化** - 用户选择会保存到 localStorage

---

## 自定义

### 扩展 Head

在站点根目录创建 `layouts/partials/extend_head.html`，可添加自定义 CSS、JS 或 meta 标签：

```html
<!-- 自定义 CSS -->
<style>
  :root {
    --primary-color: #your-color;
  }
</style>

<!-- 自定义 JS -->
<script>
  // Your custom JavaScript
</script>
```

---

## 要求

- Hugo Extended **v0.146.0** 或更高版本

---

## 许可证

[MIT License](LICENSE)

---

## 致谢

- [Sakura](https://github.com/mashirozx/Sakura) - 设计灵感来源
- [highlight.js](https://highlightjs.org/) - 代码语法高亮
- [Mermaid](https://mermaid.js.org/) - 图表渲染
