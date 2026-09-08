# 写作指南

中文文章保存在 `src/content/posts/zh/`，英文文章保存在 `src/content/posts/en/`，支持普通 Markdown（`.md`）。项目没有启用 MDX 集成，新建脚本也只生成 `.md`。本文中的示例仅用于说明，不会自动出现在博客中。

首次安装与运行见 [README](../README.md#first-run)，提交和上线步骤见 [部署指南](DEPLOYMENT.zh-CN.md)。

## 新建文章

在仓库根目录运行：

```sh
pnpm new-post zh/my-first-post
pnpm dev
```

脚本会创建 `src/content/posts/zh/my-first-post.md`，默认 `draft: true`、`lang: zh_CN`，发布日期填写运行当天。已有文件不会被覆盖。把标题、日期和正文改成自己的内容，浏览器中打开开发服务显示的地址。

建议文件名使用小写英文、数字和连字符，例如 `binary-search-notes`。中文标题写在 `title` 中，文件名只负责组织文件与默认访问地址。

英文文章使用 `pnpm new-post en/my-first-post`，打开本地 `/en/` 预览。省略语言前缀时默认创建在 `zh/`。不要把 Markdown 直接放在 `posts/` 根目录或其他语言目录，构建会提示位置错误。

同相对路径的 `zh/my-first-post.md` 和 `en/my-first-post.md` 自动成为对应译文；它们不必同时发布。文章配对、独立内容、语言切换和搜索规则见 [双语维护指南](I18N.zh-CN.md)。

## 单文件与目录式写作

短文章可以直接创建一个文件：

```text
src/content/posts/zh/
└── binary-search-notes.md
```

访问地址为 `/zh/posts/binary-search-notes/`。

多图文章适合使用独立目录：

```sh
pnpm new-post zh/binary-search-notes/index
```

再把相关图片放进文章目录：

```text
src/content/posts/zh/
└── binary-search-notes/
    ├── index.md
    ├── cover.png
    └── steps.png
```

英文目录中的文章对应 `/en/posts/…/`。中文目录中的 `index.md` 同样对应 `/zh/posts/binary-search-notes/`。例如 `notes/binary-search.md` 对应 `/zh/posts/notes/binary-search/`。不要同时保留 `binary-search-notes.md` 与 `binary-search-notes/index.md`，两者会得到同一个默认地址。

默认地址由路径生成，末尾的 `/index` 会去掉。发布后尽量不随意重命名文件或目录，避免改变读者已保存的链接；只改 `title` 不会改变地址。

## 文章头部字段

每篇文章开头是两行 `---` 包围的 YAML，称为 frontmatter；正文写在第二个 `---` 后。完整示例：

```markdown
---
title: "二分查找：边界与循环条件"
published: 2026-09-08
updated: 2026-09-09
description: "记录二分查找的区间约定与常见边界问题。"
image: ./cover.png
tags: [算法, 二分查找]
category: 学习笔记
draft: true
lang: zh_CN
---

## 问题

从这里开始写正文。
```

此示例假设文章目录中已有 `cover.png`；没有封面时将 `image` 改成 `''`。`updated` 用于后续修改，没有更新日期时整行删除。

| 字段 | 写法与作用 |
| --- | --- |
| `title` | 必填，文章标题；包含冒号等字符时用引号包住 |
| `published` | 必填，发布日期，使用不加引号的 `YYYY-MM-DD`；列表按此日期倒序 |
| `updated` | 可选，最近更新日期，格式同上；不用时删除，不写空值 |
| `description` | 简短摘要，不填写时使用空字符串 |
| `image` | 封面路径；没有封面时填 `''`，路径规则见下文 |
| `tags` | 标签数组，例如 `[算法, 笔记]`；没有标签时填 `[]` |
| `category` | 一个分类名称；留空字符串时归入未分类 |
| `draft` | `true` 为草稿，`false` 为准备公开；使用布尔值，不加引号 |
| `lang` | 可省略并由目录推断；中文填写 `zh_CN`（也接受 `zh`、`zh-CN`），英文填写 `en`；与目录冲突会报错 |
| `translationKey` | 可选，对应译文填写同一个值；省略时以去掉语言前缀的文章路径自动配对 |

不要填写 `prevTitle`、`prevSlug`、`nextTitle`、`nextSlug`，这些由程序生成。保持 YAML 缩进一致，日期用真实有效日期，标签不要写成逗号拼接的字符串。

## 图片

### 放在文章目录中

对于 `src/content/posts/zh/binary-search-notes/index.md`，将 `cover.png`、`steps.png` 放在同一个目录：

```yaml
image: ./cover.png
```

正文使用标准 Markdown 图片：

```markdown
![二分查找的区间变化](./steps.png)
```

这里的 `./` 相对当前 Markdown 文件所在目录。站点会处理 `src/` 内引用的本地图片；移动文章时应一起移动图片，或更新相对路径。

### 放在 public 中

需要固定公开地址或多篇文章复用的图片，可以放到 `public/images/diagram.png`：

```yaml
image: /images/diagram.png
```

```markdown
![流程图](/images/diagram.png)
```

引用从 `/images/` 开始，**不写 `/public/` 前缀**。`public/` 文件按原样发布，不经过 Astro 图片优化。本站使用独立域名根路径，也不添加 `/blog/` 或 `/meow/`。

正文也可以使用完整的远程图片 HTTPS 地址。图片加载问题先检查路径大小写和文件是否已提交；本地系统可能不区分大小写，但 GitHub Actions 的 Linux 环境区分。图片语法及目录规则参考 [Astro 官方图片文档](https://v5.docs.astro.build/en/guides/images/#images-in-markdown-files)。

## 正文、代码与公式

文章标题由 `title` 自动显示，正文通常从二级标题 `##` 开始。支持列表、引用、链接、表格及带语言标记的代码块。例如在正文中输入：

````markdown
## 示例

- 第一项
- 第二项

[查看归档](/zh/archive/)

```python
print("Hello, world!")
```
````

文章之间的链接使用页面地址，例如 `/zh/posts/binary-search-notes/`，不要把本地 Markdown 文件路径当作线上链接。

行内公式：

```markdown
质能方程为 $E = mc^2$。
```

独立公式的两个 `$$` 各占一行：

```markdown
$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$
```

矩阵、多行推导、分段函数及公式排错见 [LaTeX 指南](LATEX.zh-CN.md)。

## 草稿与生产预览

| 场景 | `draft: true` | `draft: false` |
| --- | --- | --- |
| `pnpm dev` 开发预览 | 可见 | 可见 |
| `pnpm build` 后的 `pnpm preview` | 不生成文章页面 | 生成文章页面 |
| GitHub Pages 线上网站 | 不发布 | 合并到 `main` 后发布 |

新建脚本默认创建草稿。手写 Markdown 时也应显式保留 `draft` 字段；现有字段校验对省略的 `draft` 默认使用 `false`。草稿只控制网站页面是否生成，推送到公开 GitHub 仓库的 Markdown 仍可在仓库中查看。

`published` 只用于日期展示和排序，**未来日期不会自动延迟发布**。需要保留未完成内容时使用 `draft: true`，准备公开时改为 `false` 后提交。

开发模式用于写作，不提供最终 Pagefind 搜索体验。检查搜索和最终发布效果时运行：

```sh
pnpm lint
pnpm check
pnpm build
pnpm preview
```

如果正在运行 `pnpm dev`，可先按 `Ctrl+C` 停止，再启动生产预览。`pnpm preview` 不会自动重建，修改后需要重新构建。没有公开文章时首页显示空状态，归档与搜索也没有文章结果。

## 修改已有文章

同步主线并新建分支后，编辑对应 Markdown 与资源。内容有实质更新时填写 `updated`，一般保留原 `published` 与文件路径。只想暂时下线文章可以改为 `draft: true`；要彻底删除时删除 Markdown，并一并清理不再使用的专属图片。

随后检查、提交并合并 PR，具体命令见 [发布步骤](DEPLOYMENT.zh-CN.md#日常写作与发布)。

## 常见问题

| 现象 | 检查方法 |
| --- | --- |
| 新文章在本地可见，构建后消失 | 检查 `draft` 是否仍为 `true` |
| 构建提示文章集合为空 | 初始目录没有文章时的提示；确认最终构建成功即可，发布文章后会消失 |
| 首页没有文章 | 清理模板后的初始状态正常；发布第一篇 `draft: false` 文章后会出现 |
| 提示 frontmatter 校验失败 | 检查 `title`、有效日期、标签数组、布尔值和 YAML 缩进 |
| `Image file not found` 或图片 404 | 检查同目录图片路径、文件名大小写，确认没有写 `/public/`，并把图片提交到 Git |
| 文章语言或配对键冲突 | 检查文章是否位于 `zh/` 或 `en/`，`lang` 是否与目录一致，同语言的 `translationKey` 是否重名 |
| 两篇文章地址冲突 | 检查是否同时存在 `name.md` 和 `name/index.md`，或路径规范化后重名 |
| 公式显示原始文本 | 检查是否在代码块内，独立公式的 `$$` 是否各占一行 |
| 搜索提示需构建或没有结果 | 用 `pnpm build` 和 `pnpm preview` 检查，确认有公开文章且关键词存在 |
| 本地已修改，网站仍旧 | 本地保存不会上线；检查 PR 是否合并、Pages 部署是否成功，再检查 ESA 缓存 |
