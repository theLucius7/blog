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
写作和部署步骤见 [部署说明](docs/DEPLOYMENT.zh-CN.md)，数学公式见 [LaTeX 说明](docs/LATEX.zh-CN.md)。

## 提交修改

- 一个 PR 聚焦一类变动，避免把内容修改、界面调整和依赖升级混在一起。
- 提交名说明具体结果，例如 `docs: 更新写作说明`、`fix: 修复文章图片路径`。
- PR 描述写清问题、修改后的行为和验证结果；界面变更附相应截图。
- 文章修改检查标题、日期、链接、图片和公式；未完成的文章设置 `draft: true`。

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

## 发布

`main` 分支更新后，GitHub Actions 自动构建并发布到 GitHub Pages，域名通过阿里云 ESA 加速。
合并前确认内容已准备发布；合并后查看 Actions 结果，并检查受影响的线上页面。
域名、Pages 与 ESA 的配置说明见 [部署说明](docs/DEPLOYMENT.zh-CN.md)。
