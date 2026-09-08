# Lucius7 的博客

[![CI](https://github.com/theLucius7/blog/actions/workflows/build.yml/badge.svg)](https://github.com/theLucius7/blog/actions/workflows/build.yml)
[![GitHub Pages](https://github.com/theLucius7/blog/actions/workflows/deploy.yml/badge.svg)](https://github.com/theLucius7/blog/actions/workflows/deploy.yml)

这是 [blog.lucius7.cn](https://blog.lucius7.cn/) 的源码仓库，基于 [Fuwari](https://github.com/saicaca/fuwari) 和 Astro 构建。文章使用 Markdown 编写，通过 GitHub Actions 构建并部署到 GitHub Pages，域名通过阿里云 ESA 加速访问。

## 当前状态

截至 2026-09-08，站点已完成部署与基础配置，内容仍在整理中。

| 项目 | 状态 |
| --- | --- |
| 线上地址 | [https://blog.lucius7.cn/](https://blog.lucius7.cn/)，使用独立域名根路径 |
| 自动发布 | `main` 更新后检查、构建并部署到 GitHub Pages |
| 数学公式 | `remark-math` + `rehype-katex`，支持行内公式与独立公式 |
| 阅读功能 | 明暗主题、文章分类与标签、Pagefind 搜索、RSS、站点地图 |
| 社交链接 | 已配置 GitHub、X、LinkedIn |
| 页脚备案 | [蜀ICP备2026023763号-1](https://beian.miit.gov.cn/) |
| 站点内容 | 仍保留 Fuwari 标题、副标题、示例头像、个人介绍、关于页及示例文章，待替换为个人内容 |

当前仓库由 `theLucius7/meow` 更名而来；原 AstroPaper 博客仓库已删除，旧文章尚未迁入此仓库。项目以当前源码与线上页面为准。

公开访问的 HTTPS 由 ESA 提供。GitHub Pages 源站证书仍需单独处理，具体状态与排查入口见 [部署说明](docs/DEPLOYMENT.zh-CN.md#域名与-https)。

## 本地运行

使用 **Node.js 22（至少 22.12）** 和 **pnpm 9.14.4**。项目通过 `.nvmrc`、`engines` 与 `packageManager` 记录环境要求。

```sh
git clone https://github.com/theLucius7/blog.git
cd blog
nvm install
nvm use
npm install -g pnpm@9.14.4
pnpm install --frozen-lockfile
pnpm dev
```

没有使用 nvm 时，直接安装符合要求的 Node.js 版本，跳过两条 `nvm` 命令。浏览器打开终端显示的地址，默认是 `http://localhost:4321/`。

## 写作与配置

创建一篇 Markdown 文章：

```sh
pnpm new-post my-first-post
```

编辑生成的 `src/content/posts/my-first-post.md`。脚本默认生成 `draft: false`，未完成的文章请先改成 `true`，准备发布时再改回 `false`。

```yaml
---
title: 我的第一篇文章
published: 2026-09-08
description: 这篇文章的简短介绍
image: ''
tags: [笔记]
category: 日常
draft: true
lang: zh_CN
---
```

正文写在第二个 `---` 下方。行内公式使用 `$E = mc^2$`；独立公式的两个 `$$` 各占一行。矩阵、多行推导与常见问题见 [LaTeX 写作说明](docs/LATEX.zh-CN.md)。

| 文件或目录 | 用途 |
| --- | --- |
| `src/config.ts` | 博客标题、语言、头像、个人介绍、导航和社交链接 |
| `src/content/posts/` | Markdown 文章及文章资源 |
| `src/content/spec/about.md` | 关于页面 |
| `src/content/config.ts` | 文章字段与校验规则 |
| `src/components/Footer.astro` | 页脚及备案链接 |
| `astro.config.mjs` | 站点地址、Astro 集成与 Markdown 插件 |
| `public/` | 直接发布的静态资源和 `CNAME` |
| `.github/workflows/` | 检查与 GitHub Pages 发布流程 |

## 检查与发布

```sh
pnpm lint
pnpm check
pnpm build
pnpm preview
```

- `pnpm lint`：只读检查代码；`pnpm lint:fix` 可以自动修复部分问题。
- `pnpm check`：检查 Astro、Svelte 和 TypeScript；`pnpm type-check` 是相同检查的别名。
- `pnpm build`：生成 `dist/` 静态页面及 Pagefind 搜索索引。
- `pnpm preview`：预览已构建的站点。

建议通过 PR 提交修改，确认 CI 通过后合并到 `main`。发布工作流会再次运行检查与完整构建；发布结果可在 [Actions](https://github.com/theLucius7/blog/actions/workflows/deploy.yml) 查看。只需提交源码，不要提交 `dist/` 或 `node_modules/`。

GitHub Pages、独立域名、ESA 与缓存配置见 [部署说明](docs/DEPLOYMENT.zh-CN.md)。

## 维护约定

技术栈为 Astro 5、Svelte 5、Tailwind CSS 3 与 TypeScript。依赖的准确版本以 `package.json` 和 `pnpm-lock.yaml` 为准。

Dependabot 每周检查依赖：补丁更新合并成一组，次版本更新单独提出 PR，大版本升级另行规划。KaTeX 的渲染器、样式与字体必须使用一致版本，暂不单独自动升级 KaTeX 次版本。所有更新都需验证后合并。

问题反馈、内容勘误和改进建议可提交 [Issue](https://github.com/theLucius7/blog/issues)。修改范围、提交说明和验证要求见 [CONTRIBUTING.md](CONTRIBUTING.md)。Fuwari 模板的通用说明与多语言文档请查阅 [上游仓库](https://github.com/saicaca/fuwari)。

## 致谢与许可

感谢 [Fuwari](https://github.com/saicaca/fuwari)、[Astro](https://astro.build/) 及所使用的开源项目。

项目代码沿用 [MIT 许可证](LICENSE)，保留原作者署名。文章版权配置见 `src/config.ts`；示例文章、图片与其他第三方素材仍需遵循各自的授权说明。
