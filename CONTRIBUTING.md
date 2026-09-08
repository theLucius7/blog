# 博客维护说明

本仓库维护 [blog.lucius7.cn](https://blog.lucius7.cn/)，基于 Fuwari 与 Astro 5。
内容勘误、阅读体验改进和代码修复都可以通过 Issue 或 Pull Request 提交。

## 本地开发

使用 Node.js 22（至少 22.12）和 pnpm 9.14.4，与持续集成环境保持一致：

```sh
npm install -g pnpm@9.14.4
pnpm install --frozen-lockfile
pnpm dev
```

文章位于 `src/content/posts/`，站点与社交链接配置位于 `src/config.ts`。
文章字段、图片与草稿见 [写作指南](docs/WRITING.zh-CN.md)，提交与上线步骤见 [部署说明](docs/DEPLOYMENT.zh-CN.md)，数学公式见 [LaTeX 说明](docs/LATEX.zh-CN.md)。

## 提交修改

- 一个 PR 聚焦一类变动，避免把内容修改、界面调整和依赖升级混在一起。
- 提交名说明具体结果，例如 `docs: 更新写作说明`、`fix: 修复文章图片路径`。
- PR 描述写清问题、修改后的行为和验证结果；界面变更附相应截图。
- 文章修改检查标题、日期、链接、图片和公式；新建脚本默认 `draft: true`，准备公开时改为 `false`。

代码或依赖变更提交前运行：

```sh
pnpm lint
pnpm check
pnpm build
```

`pnpm lint` 只检查代码；需要自动修复时运行 `pnpm lint:fix`，然后检查产生的修改。
构建会生成静态页面和 Pagefind 搜索索引，可用 `pnpm preview` 检查最终效果。
只修改文档时，可在 PR 中说明检查范围和未运行构建的原因。

## 依赖更新

修改依赖时同步提交 `package.json` 与 `pnpm-lock.yaml`。
检查发布说明、版本兼容性和构建结果；Astro、Svelte 等主要依赖的大版本升级需单独验证。
Dependabot PR 也应经过检查与页面验证，不因来自机器人或检查通过就盲目自动合并。

Expressive Code 的核心、Astro 集成和插件由 Dependabot 放在同一组更新，避免只升级核心而保留另一套旧渲染器。KaTeX 更新需核对 `rehype-katex` 使用的渲染版本与直接依赖提供的 CSS、字体是否一致。当前文章目录为空，涉及 Markdown、公式或代码块的升级应使用临时文章验证实际渲染，验证后删除临时文件。

## PR 处理流程

1. 阅读变更和官方发布说明，标题使用 `类型(范围): 具体改动`，说明中写明目的、兼容性和验证结果。
2. 同步最新 `main`，处理冲突；不要把旧提交的绿色检查当作当前版本已经通过。
3. 等待当前 PR 的 CI 通过。依赖更新还要验证受影响的公式、代码块或页面；只修改文档时说明检查范围。
4. 已满足条件的 PR 使用 **Squash and merge** 合并，保留一条清晰的主线提交，并删除已合并的远程分支。重复、过时或不兼容的 PR 写明理由后关闭。
5. 确认主分支 CI 与 GitHub Pages 部署成功，并打开线上网站检查。多个依赖 PR 连续合并时，在后续 PR 上验证前面已合并的更新组合。

无需为了清空列表而合并未经验证的更新；Dependabot 之后仍会按每周计划提出新 PR。

## 发布

`main` 分支更新后，GitHub Actions 自动构建并发布到 GitHub Pages，域名通过阿里云 ESA 加速。
合并前确认内容已准备发布；合并后查看 Actions 结果，并检查受影响的线上页面。
域名、Pages 与 ESA 的配置说明见 [部署说明](docs/DEPLOYMENT.zh-CN.md)。
