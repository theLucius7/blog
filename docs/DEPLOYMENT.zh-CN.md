# 本地运行与部署

网站：[blog.lucius7.cn](https://blog.lucius7.cn/) · 源码：[theLucius7/blog](https://github.com/theLucius7/blog)

文章格式与图片说明见 [写作指南](WRITING.zh-CN.md)，数学公式见 [LaTeX 指南](LATEX.zh-CN.md)。

## 安装开发环境

安装 Git 与 Node.js 22（至少 22.12），然后安装项目指定的 pnpm 9.14.4：

```sh
node --version
npm install -g pnpm@9.14.4
pnpm --version
git clone https://github.com/theLucius7/blog.git
cd blog
pnpm install --frozen-lockfile
pnpm dev
```

如果使用 nvm，可在仓库目录执行 `nvm install` 与 `nvm use`，再安装 pnpm 和依赖。`.nvmrc` 指定 Node.js 22，`package.json` 的 `engines` 与 `packageManager` 记录详细版本要求。不要在已有工作副本里重复克隆仓库。

打开终端显示的网址，默认是 `http://localhost:4321/`。开发模式会显示草稿；按 `Ctrl+C` 停止。端口被占用时使用终端实际显示的端口，或执行 `pnpm dev --port 4322`。

## 日常写作与发布

### 1. 同步代码并创建分支

在开始新一轮修改前执行：

```sh
git status
git switch main
git pull --ff-only
git switch -c post/my-first-post
pnpm install --frozen-lockfile
```

先确认 `git status` 中没有未处理的本地修改，再切换分支。每轮改动选择不同分支名，例如 `post/binary-search`、`docs/update-about`；`git pull --ff-only` 若提示不能快进，先查看分支历史，不要强行覆盖本地提交。

### 2. 编辑与预览

```sh
pnpm new-post my-first-post
pnpm dev
```

编辑 `src/content/posts/my-first-post.md`，默认是 `draft: true`。已有文章直接编辑对应文件，无需重新运行创建命令。图片、目录式文章和字段说明见 [写作指南](WRITING.zh-CN.md)。

### 3. 检查正式发布效果

准备公开的文章改为 `draft: false`，停止开发服务后运行：

```sh
pnpm lint
pnpm check
pnpm build
pnpm preview
```

构建会先清除 Astro 内容缓存，再排除草稿并生成 `dist/` 中的静态页面及 Pagefind 搜索索引，避免已删除文章残留。用预览地址检查标题、图片、公式、链接和搜索；再次修改后重新运行 `pnpm build`。`pnpm lint` 不会修改文件，需要自动修复时运行 `pnpm lint:fix` 并检查其改动。

### 4. 提交并推送

停止预览服务，检查要提交的内容：

```sh
git status
git diff
git add src/content/posts/my-first-post.md
git commit -m "docs: 发布第一篇文章"
git push -u origin post/my-first-post
```

目录式文章可以暂存整个文章目录，例如 `git add src/content/posts/my-first-post/`。站点配置或其他资源有修改时，明确加入对应路径。不要提交构建产物或依赖目录。

### 5. 合并 PR 并检查线上

打开 [仓库 Pull Requests](https://github.com/theLucius7/blog/pulls)，创建写作分支到 `main` 的 PR，说明修改和验证结果。确认 CI 通过后合并。分支推送和 PR 创建不会直接更新线上站点；合并到 `main` 才触发发布。

在 [Deploy to GitHub Pages](https://github.com/theLucius7/blog/actions/workflows/deploy.yml) 查看当前提交的运行结果。成功后打开 [网站](https://blog.lucius7.cn/) 检查受影响页面。工作流也支持在 Actions 页面手动运行。

完成后，在本地同步合并后的主线：

```sh
git switch main
git pull --ff-only
```

## 自动部署配置

CI 使用 Node.js 22、指定版本的 pnpm 与锁文件，依次执行 `pnpm lint`、`pnpm check`、`pnpm build`。PR 检查通过后，合并到 `main` 会触发发布工作流：再次检查并完整构建，上传构建产物，再部署到 GitHub Pages。发布不复用 Astro 内容缓存，以免删除文章后仍生成旧内容。

在 [Settings → Pages](https://github.com/theLucius7/blog/settings/pages) 中，发布来源应为 **GitHub Actions**，Custom domain 为 `blog.lucius7.cn`。只需要提交源码，GitHub Pages 不需要单独维护 `gh-pages` 分支。

## 域名与 HTTPS

当前 `astro.config.mjs` 设置为：

```js
site: "https://blog.lucius7.cn/",
```

独立域名使用根路径，不设置 `base`，文章地址为 `/posts/文章名/`。仓库名称为 `blog` 也不需要 `/blog/` 路径前缀。

`public/CNAME` 记录目标域名；使用 Actions 发布时，实际绑定以 GitHub Pages 设置为准，不能只修改此文件。更换域名需要同步修改 `site`、`public/CNAME`、Pages 绑定和 DNS/CDN 配置。当前域名绑定到 `theLucius7/blog`，不应同时绑定另一个仓库。

访问链路为：浏览器 → 阿里云 ESA → GitHub Pages。ESA 回源域名可指向 `thelucius7.github.io`，回源 Host 应为 `blog.lucius7.cn`，不添加仓库名称作为路径前缀。更新后若仍显示旧内容，在 ESA 刷新对应页面缓存，并检查浏览器缓存。

**截至 2026-09-08 的证书状态：** 公开站点可通过 HTTPS 访问，使用 ESA 提供的证书；GitHub Pages API 返回源站证书状态 `bad_authz`，`https_enforced` 为 `false`。公开访问正常不代表源站证书已经恢复。后续需按 [GitHub 自定义域名说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) 检查域名验证与证书签发，并确认 ESA 的回源协议、证书校验设置。源站证书恢复后，再确认是否启用 Pages 的 Enforce HTTPS。

## 常见问题

| 现象 | 处理方式 |
| --- | --- |
| 找不到 `node` 或 `pnpm` | 检查 Node.js 安装；使用 nvm 时先执行 `nvm use`，再安装指定 pnpm |
| Node.js 版本不符合要求 | 使用 Node.js 22.12 或更高的 22.x；不要直接使用其他大版本替代 |
| `--frozen-lockfile` 安装失败 | 先同步代码，确认 `package.json` 与锁文件来自同一提交；依赖变更应同时更新二者 |
| 本地正常，CI 失败 | 打开失败步骤日志，重点检查文件大小写、遗漏提交的图片和环境版本 |
| 推送被拒绝 | 检查 GitHub 登录与仓库写权限；已有远端修改时先同步并处理冲突，不使用强推覆盖 |
| PR 已合并但网站没变 | 确认当前提交的 Pages 运行成功，再刷新 ESA 与浏览器缓存 |
| 构建或部署失败 | 检查 Actions 的失败步骤；发布成功前网站继续提供上一次成功部署的版本 |
| 需要撤回已上线修改 | 在 GitHub 对对应 PR 创建 Revert PR，检查并合并，让工作流重新发布恢复后的源码 |

维护约定与依赖更新说明见 [CONTRIBUTING.md](../CONTRIBUTING.md)。
