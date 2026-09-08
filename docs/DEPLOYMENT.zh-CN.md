# 博客使用与部署

网站：[blog.lucius7.cn](https://blog.lucius7.cn/) · 源码：[theLucius7/blog](https://github.com/theLucius7/blog)

## 本地预览

使用 Node.js 22（至少 22.12）和项目指定的 pnpm 9.14.4。在仓库根目录执行：

```sh
npm install -g pnpm@9.14.4
pnpm install --frozen-lockfile
pnpm dev
```

打开终端显示的网址，默认是 `http://localhost:4321/`。使用 nvm 时可先运行 `nvm install`、`nvm use`，读取仓库的 `.nvmrc`。

## 写文章

```sh
pnpm new-post my-first-post
```

编辑 `src/content/posts/my-first-post.md`：设置标题、日期、分类和标签，在文件头的第二个 `---` 下方写正文。脚本默认生成 `draft: false`；尚未写完时请先改为 `true`，准备发布时再改回 `false`。

博客名称、语言、头像和个人介绍在 `src/config.ts` 中配置；关于页面在 `src/content/spec/about.md`。当前仍保留 Fuwari 模板的示例内容，原 AstroPaper 博客的文章尚未迁入。

文章已支持 LaTeX 数学公式：行内使用 `$E = mc^2$`，独立公式使用上下各占一行的 `$$`。矩阵、多行推导及注意事项见 [LaTeX 写作说明](LATEX.zh-CN.md)。

## 发布更新

```sh
pnpm lint
pnpm check
pnpm build
pnpm preview
```

预览确认后，建议通过 PR 提交并合并到 `main`。CI 使用 Node.js 22、锁定的 pnpm 与 Biome，依次执行只读代码检查、Astro 检查和完整构建。`pnpm build` 同时生成静态页面和 Pagefind 搜索索引。

`main` 更新会触发 **Deploy to GitHub Pages**：先执行同样的检查与构建，再上传并发布构建产物；也可以在 [Actions](https://github.com/theLucius7/blog/actions/workflows/deploy.yml) 手动运行。部署失败时查看对应运行的失败步骤，网站会继续提供上一次成功发布的版本。

在本仓库 [Settings → Pages](https://github.com/theLucius7/blog/settings/pages) 中，发布来源应为 **GitHub Actions**，Custom domain 为 `blog.lucius7.cn`。

## 域名与 HTTPS

当前 `astro.config.mjs` 设置为：

```js
site: "https://blog.lucius7.cn/",
```

独立域名使用根路径，不设置 `base`，文章地址为 `/posts/文章名/`。仓库改名为 `blog` 后也不需要 `/blog/` 路径前缀。

`public/CNAME` 记录目标域名；使用 Actions 发布时，实际绑定以 GitHub Pages 设置为准，不能只修改这个文件。更换域名需要同步修改 `site`、`public/CNAME`、Pages 绑定和 DNS/CDN 配置。当前域名绑定到 `theLucius7/blog`，不应同时绑定另一个仓库。

访问链路为：浏览器 → 阿里云 ESA → GitHub Pages。ESA 回源域名可指向 `thelucius7.github.io`，回源 Host 应为 `blog.lucius7.cn`，不添加仓库名称作为路径前缀。更新后若仍显示旧内容，在 ESA 刷新对应页面缓存，并检查浏览器缓存。

**截至 2026-09-08 的证书状态：** 公开站点可通过 HTTPS 访问，使用 ESA 提供的证书；GitHub Pages API 返回源站证书状态 `bad_authz`，`https_enforced` 为 `false`。公开访问正常不代表源站证书已经恢复。后续需按 [GitHub 自定义域名说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) 检查域名验证与证书签发，并确认 ESA 的回源协议、证书校验设置。源站证书恢复后，再确认是否启用 Pages 的 Enforce HTTPS。

发布与维护约定见 [CONTRIBUTING.md](../CONTRIBUTING.md)。
