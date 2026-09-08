# Lucius7's Blog

[![CI](https://github.com/theLucius7/blog/actions/workflows/build.yml/badge.svg)](https://github.com/theLucius7/blog/actions/workflows/build.yml)
[![GitHub Pages](https://github.com/theLucius7/blog/actions/workflows/deploy.yml/badge.svg)](https://github.com/theLucius7/blog/actions/workflows/deploy.yml)

[blog.lucius7.cn](https://blog.lucius7.cn/) 的源码仓库，基于 [Fuwari](https://github.com/saicaca/fuwari) 和 Astro。文章用 Markdown 编写，合并到 `main` 后由 GitHub Actions 自动发布到 GitHub Pages，通过阿里云 ESA 提供域名访问。

## 当前状态

截至 2026-09-08，模板示例文章、配图和默认个人资料已清理，站点名称为「Lucius7's Blog」，界面语言为中文。文章目录从空白开始，没有公开文章时首页显示空状态；原 AstroPaper 博客的文章尚未迁入。

| 项目 | 当前配置 |
| --- | --- |
| 网站 | [blog.lucius7.cn](https://blog.lucius7.cn/)，独立域名根路径 |
| 作者 | Lucius7 |
| 头像 | QQ 3012967200 的头像，使用腾讯 HTTPS 头像接口 |
| 站点图标 | `public/icon.svg`，L7 字标 |
| 写作 | Markdown；新文章默认是草稿，本地开发可预览 |
| 阅读 | 明暗主题、分类与标签、Pagefind 搜索、RSS、站点地图 |
| 数学公式 | `remark-math` + `rehype-katex`，样式与字体随站点发布 |
| 社交链接 | GitHub、X、LinkedIn |
| 页脚备案 | [蜀ICP备2026023763号-1](https://beian.miit.gov.cn/) |
| 发布 | `main` 更新后执行代码检查、类型检查、构建和部署 |

公开站点的 HTTPS 由 ESA 提供；GitHub Pages 源站证书仍有独立待办，见 [域名与 HTTPS](docs/DEPLOYMENT.zh-CN.md#域名与-https)。

## 第一次运行

需要 Git、**Node.js 22（至少 22.12）** 和 **pnpm 9.14.4**。先安装 Node.js，再在终端执行：

```sh
git clone https://github.com/theLucius7/blog.git
cd blog
npm install -g pnpm@9.14.4
pnpm install --frozen-lockfile
pnpm dev
```

使用 nvm 管理 Node.js 时，在安装 pnpm 前执行 `nvm install` 和 `nvm use`，读取仓库的 `.nvmrc`。打开终端显示的地址，默认是 `http://localhost:4321/`。保存文章或配置后，开发页面会更新；按 `Ctrl+C` 停止服务。

## 写第一篇文章

在仓库目录中，先同步主线并创建写作分支：

```sh
git switch main
git pull --ff-only
git switch -c post/my-first-post
pnpm new-post my-first-post
pnpm dev
```

编辑生成的 `src/content/posts/my-first-post.md`。脚本默认生成 `draft: true` 和 `lang: zh_CN`；正文写在第二个 `---` 下方：

```markdown
---
title: "我的第一篇文章"
published: 2026-09-08
description: "用一句话介绍这篇文章"
image: ''
tags: [笔记]
category: 日常
draft: true
lang: zh_CN
---

## 开始记录

这里写正文。行内公式可以写成 $E = mc^2$。
```

将日期改为实际发布日期。用 `pnpm dev` 预览草稿；准备公开时改为 `draft: false`。**`pnpm build` 和线上发布会排除草稿**，所以生产预览中看不到草稿是正常行为。

多图文章可以用 `pnpm new-post my-first-post/index` 创建文章目录，正文和图片放在一起。单文件和目录式二选一，不要同时创建同名文章。字段、图片路径、文章地址与 Markdown 示例见 [完整写作指南](docs/WRITING.zh-CN.md)，数学公式见 [LaTeX 指南](docs/LATEX.zh-CN.md)。

## 检查并发布

停止开发服务，将准备发布的文章设为 `draft: false`，然后运行：

```sh
pnpm lint
pnpm check
pnpm build
pnpm preview
```

打开终端给出的地址，检查文章、图片、公式和搜索。`pnpm preview` 展示上一次构建产物；再次修改后需要重新运行 `pnpm build`。构建会清除 Astro 内容缓存，确保删除的文章不再出现在产物中。

确认后提交这篇文章：

```sh
git status
git add src/content/posts/my-first-post.md
git commit -m "docs: 发布第一篇文章"
git push -u origin post/my-first-post
```

若文章包含图片，把对应图片路径一并加入 `git add`。到 [GitHub 仓库](https://github.com/theLucius7/blog) 创建该分支到 `main` 的 Pull Request，确认 CI 通过后合并。随后在 [发布工作流](https://github.com/theLucius7/blog/actions/workflows/deploy.yml) 查看结果，成功后打开网站检查。

日常同步、更新已有文章、发布失败与缓存排查见 [部署指南](docs/DEPLOYMENT.zh-CN.md)。只提交源码和文章资源，不提交 `dist/`、`.astro/` 或 `node_modules/`。

## 常用配置与目录

| 文件或目录 | 用途 |
| --- | --- |
| `src/content/posts/` | 文章 Markdown 与文章专用图片 |
| `src/content/spec/about.md` | 关于页面 |
| `src/config.ts` | 站点名称、语言、主题色、头像、简介、导航、社交链接和文章许可证 |
| `src/content/config.ts` | 文章 frontmatter 字段与校验规则 |
| `src/components/Footer.astro` | 页脚及备案链接 |
| `src/assets/` | 由 Astro 处理的站点资源，可按需创建目录 |
| `public/` | 原样发布的静态文件；`CNAME` 记录域名 |
| `astro.config.mjs` | 站点地址、Astro 集成与 Markdown 插件 |
| `scripts/new-post.js` | 生成 Markdown 草稿 |
| `.github/workflows/` | CI 与 GitHub Pages 发布流程 |
| `docs/` | 写作、数学公式、部署和维护说明 |

当前头像由 `profileConfig.avatar` 直接引用腾讯接口 `https://q1.qlogo.cn/g?b=qq&nk=3012967200&s=640`。修改 QQ 头像后，网站会在浏览器及接口缓存更新后显示新头像，无需替换仓库图片。

站点头像和横幅也可使用本地图片：相对 `src/` 时写 `assets/...`，使用 `public/` 文件时写 `/images/...`。文章封面与正文图片的路径规则见 [图片说明](docs/WRITING.zh-CN.md#图片)。

在 `src/config.ts` 中可以修改：

| 配置项 | 用途 |
| --- | --- |
| `siteConfig.title`、`subtitle`、`lang` | 网站名称、副标题和界面语言 |
| `siteConfig.themeColor.hue` | 主题色；范围为 0–360 |
| `siteConfig.banner.enable`、`src` | 是否启用横幅及横幅图片 |
| `profileConfig.avatar`、`name`、`bio` | 头像、作者名和简介 |
| `profileConfig.links` | 侧栏社交链接及图标 |
| `navBarConfig.links` | 顶部导航 |
| `licenseConfig` | 文章底部许可证显示与链接 |

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 开发预览，包含草稿 |
| `pnpm new-post 名称` | 创建 `.md` 草稿，也可传 `目录/index` |
| `pnpm lint` | 只读代码检查 |
| `pnpm lint:fix` | 自动修复部分代码格式与检查问题 |
| `pnpm check` | Astro、Svelte 和 TypeScript 检查；`type-check` 是其别名 |
| `pnpm build` | 构建公开页面和 Pagefind 搜索索引 |
| `pnpm preview` | 预览已构建站点，不包含草稿 |

## 维护与许可

技术栈为 Astro 5、Svelte 5、Tailwind CSS 3 和 TypeScript。依赖准确版本以 `package.json` 与 `pnpm-lock.yaml` 为准。Dependabot 每周检查 npm 与 GitHub Actions：Expressive Code 的核心、Astro 集成和插件一起更新；其他 npm 补丁更新分组，次版本单独提出 PR，大版本及 KaTeX 跨次版本升级另行评估。

PR（Pull Request）是将分支修改合并到 `main` 的申请。Dependabot 创建的 PR 是依赖更新建议，不代表网站出错，也不需要看到就立即合并。处理时核对更新内容与兼容性，确认最新代码的 CI 通过，再用 **Squash and merge** 合并并删除已合并分支；不适用或重复的更新应写明原因后关闭。合并会触发网站发布，完成后检查线上页面。完整约定见 [PR 处理流程](CONTRIBUTING.md#pr-处理流程)。

反馈问题或内容勘误可提交 [Issue](https://github.com/theLucius7/blog/issues)。提交约定见 [CONTRIBUTING.md](CONTRIBUTING.md)，Fuwari 的通用主题文档见 [上游仓库](https://github.com/saicaca/fuwari)。

感谢 Fuwari、Astro 及所使用的开源项目。项目代码沿用 [MIT 许可证](LICENSE)并保留原作者署名；文章许可证在 `src/config.ts` 中配置。新增图片和其他第三方素材应遵循各自授权。
