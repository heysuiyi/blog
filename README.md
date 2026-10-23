# SuiYI · 把好奇写下来

一个慢慢积累的个人博客。记录技术、项目与长期思考，也拆开生活里具体而微的事物，看看它们怎样运转。

以安静的阅读体验为中心：纸白与暮色、留白与细线，让文字成为页面的主角。

[访问博客](https://putl.online/) · [全部文章](https://putl.online/blog/) · [学习日报](https://putl.online/daily/) · [RSS 订阅](https://putl.online/rss.xml)

## 可以在这里读什么

- **文章与专栏**：首页展示最近写下的文章，支持按分类切换；归档页提供分类、标签与全文关键词搜索。
- **科技与设计学习日报**：独立的日报入口与往期归档，涵盖科研技术、模型与产品、配置实践、架构设计和 UI 布局。首页单独展示最新一期，不挤占个人文章列表。
- **随机漫步**：从非日报文章中随手翻一篇，先显示标题与链接，再决定是否阅读。

## 阅读体验

- **纸白 / 暮色 / 随系统**：主题选择保存在浏览器本地，刷新后仍然生效；随系统模式响应系统配色变化。
- **可选雨声**：点击后才通过 Web Audio 在本机合成，不加载外部音频文件。支持暂停、静音和音量调节，翻页或刷新后不会自动续播，也没有自动播放的背景音乐。
- **响应式布局**：适配桌面与手机，保留清晰的键盘焦点、状态提示，并尊重减少动态效果的系统设置。
- **静态内容优先**：关闭 JavaScript 仍可阅读文章、浏览分类和标签；搜索、配色切换、雨声及首页交互需要 JavaScript。
- **基础订阅与分享**：提供 RSS、站点地图、canonical URL 和 Open Graph 元信息。

首页的「静态寄语」和「示例闪念」来自配置文件，不是在线状态、实时动态或自动同步的数据。可以替换为自己的文字，也可以直接关闭。

## 技术与环境

- [Astro](https://astro.build/) 静态站点生成，当前锁定版本为 **7.3.1**。
- Markdown / MDX 内容集合，使用 Zod 校验文章 frontmatter。
- Astro 组件、TypeScript 与原生 CSS；图片处理使用 Astro 图片能力与 Sharp。
- `@astrojs/mdx`、`@astrojs/rss`、`@astrojs/sitemap` 分别提供 MDX、订阅与站点地图支持。
- **Node.js >= 22.12.0**，使用 **npm >= 9.6.5**；仓库提交了 `package-lock.json`，以 `npm ci` 安装锁定依赖。

## 本地运行

在项目根目录执行：

```sh
npm ci
npm run dev -- --background
```

默认访问 <http://localhost:4321>。按项目约定，开发服务以后台模式运行。

| 命令 | 用途 |
| --- | --- |
| `npm ci` | 按锁文件安装依赖 |
| `npm run dev -- --background` | 启动后台开发服务 |
| `npm run astro -- dev status` | 查看开发服务状态 |
| `npm run astro -- dev logs` | 查看开发服务日志 |
| `npm run astro -- dev stop` | 停止后台开发服务 |
| `npm run build` | 构建静态站点，输出到 `dist/` |
| `npm run preview` | 本地预览已构建的站点，需先执行构建 |
| `npm run astro -- --help` | 查看 Astro CLI 帮助 |

目前没有单独配置 `check`、`lint` 或 `test` 脚本。提交前至少执行 `npm run build`，并预览受影响的页面。

## 内容维护

### 写一篇文章

在 `src/content/blog/` 下新建 `.md` 或 `.mdx` 文件，例如 `my-new-post.md`：

```md
---
title: "把一个问题讲清楚"
description: "记录一次学习、实践或观察。"
pubDate: "2026-10-23"
category: "随笔"
tags: ["学习", "记录"]
---

从一个具体的问题开始，写下正文。
```

这篇文章的地址为 `/blog/my-new-post/`。

- 必填字段是 `title`、`description` 和 `pubDate`。
- `category` 默认是「随笔」，`tags` 默认是空数组。
- 可选 `updatedDate` 用于标记更新日期；可选 `heroImage` 引用相对于文章文件的本地图片路径。
- 所有内容字段以 [`src/content.config.ts`](src/content.config.ts) 为准。写作与图片资源可分别放在 `src/content/blog/` 和 `src/assets/`，无需编译处理的文件放在 `public/`。
- 当前没有草稿或未来发布日期过滤。放入内容目录的文章会参与构建，未准备发布的内容请先留在目录之外。

### 发布一期日报

日报与普通文章使用同一内容集合和文章地址。将 `category` 设为 `日报`，即可进入 `/daily/` 归档；额外的 `daily` 字段用于展示期号与本期主题：

```yaml
---
title: "科技与设计学习日报 · 2026年10月24日 · 第2期"
description: "本期内容的简短摘要。"
pubDate: "2026-10-24"
category: "日报"
tags: ["AI", "架构设计"]
daily:
  issue: 2
  headline: "本期主题"
---
```

`issue` 必须是正整数，`headline` 不能为空。日报按发布日期倒序展示；首页自动选取最新一期。这里的「自动」指构建时整理已有内容，仓库本身不负责抓取新闻或定时生成文章。

### 调整站点与首页

| 文件 | 维护内容 |
| --- | --- |
| [`src/consts.ts`](src/consts.ts) | 站点名称、描述、GitHub 链接 |
| [`astro.config.mjs`](astro.config.mjs) | 正式域名、集成与本地字体 |
| [`src/config/reading.ts`](src/config/reading.ts) | 静态寄语与示例闪念，支持分别设置 `enabled: false` 隐藏 |
| [`src/components/Hero.astro`](src/components/Hero.astro) | 首页开场文案 |
| [`src/pages/index.astro`](src/pages/index.astro) | 首页栏目、随机漫步与关于区块 |
| [`src/styles/global.css`](src/styles/global.css) | 全站颜色、排版与基础样式 |

替换闪念前请保留「示例」标识，避免把占位文字误当作个人动态。更换域名时也应更新 `astro.config.mjs` 中的 `site`，使订阅、站点地图与 canonical URL 保持一致。

## 目录速览

```text
src/
├── assets/              # 图片与本地字体
├── components/          # 导航、归档、文章卡片、阅读工具等组件
├── config/reading.ts    # 可选的首页静态文案
├── content/blog/        # Markdown / MDX 文章与日报
├── content.config.ts   # 内容集合及字段校验
├── layouts/BlogPost.astro
├── lib/taxonomy.ts      # 分类与标签工具
├── pages/              # 首页、文章、日报、分类、标签、搜索、RSS
├── scripts/            # 搜索、主题与雨声交互
└── styles/global.css
public/                 # 直接复制到站点的静态资源
docs/                   # 写作、图解与部署相关资料
.github/workflows/      # GitHub Actions 部署流程
astro.config.mjs
compose.yaml
nginx.conf
```

## 构建与部署

项目输出静态文件到 `dist/`，可以交给静态 Web 服务托管。仓库提供了 [`compose.yaml`](compose.yaml) 与 [`nginx.conf`](nginx.conf) 作为 Nginx 容器配置。

当前的 [Deploy Blog 工作流](.github/workflows/deploy.yml) 在推送到 `main` 后运行，使用 self-hosted runner 依次安装依赖、构建站点，再将构建产物复制到部署目录。**仅修改 README 的提交也会触发部署。**

这套工作流依赖现有 runner 的运行环境和部署配置，不是 fork 后即可直接使用的通用托管服务。迁移时请按自己的环境调整部署步骤，并在发布后检查 [GitHub Actions](https://github.com/heysuiyi/blog/actions) 的执行结果。

## 致谢

项目起步于 [Astro Blog Starter](https://github.com/withastro/astro/tree/main/examples/blog)，原始模板的设计参考了 [Bear Blog](https://github.com/HermanMartinus/bearblog/)。感谢这些轻量、专注内容的工具与设计。

更多框架用法可参考 [Astro 文档](https://docs.astro.build/) 和 [Content Collections 指南](https://docs.astro.build/en/guides/content-collections/)。
