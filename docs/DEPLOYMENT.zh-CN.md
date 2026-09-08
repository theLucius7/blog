# 博客使用与部署

网站地址：<https://blog.lucius7.cn/>

## 本地预览

使用 Node.js 22 和项目指定的 pnpm 9.14.4。在仓库根目录执行：

```sh
npm install -g pnpm@9.14.4
pnpm install --frozen-lockfile
pnpm dev
```

打开终端显示的网址，默认是 <http://localhost:4321/>。

## 写文章

```sh
pnpm new-post my-first-post
```

编辑 `src/content/posts/my-first-post.md`：设置标题、日期、分类和标签，然后在文件头的第二个 `---` 下方写正文。准备发布时设为 `draft: false`。

博客名称、语言、头像和个人介绍在 `src/config.ts` 中配置；关于页面在 `src/content/spec/about.md`。当前保留 Fuwari 模板的示例内容和外观。

文章已支持 LaTeX 数学公式：行内使用 `$E = mc^2$`，独立公式使用上下各占一行的 `$$`。矩阵、多行推导及注意事项见 [LaTeX 写作说明](./LATEX.zh-CN.md)。

## 发布更新

```sh
pnpm build
pnpm preview
```

预览确认后，提交修改并推送到 `main`。GitHub Actions 中的 **Deploy to GitHub Pages** 会自动构建并发布网站，也可以手动运行。构建使用 `pnpm build`，同时生成静态页面和 Pagefind 搜索索引。

在 `theLucius7/meow` 仓库的 **Settings → Pages** 中，发布来源应为 **GitHub Actions**，Custom domain 为 `blog.lucius7.cn`。

当前 `astro.config.mjs` 设置为：

```js
site: "https://blog.lucius7.cn/",
```

独立域名使用根路径，不设置 `base`，文章地址为 `/posts/文章名/`。`public/CNAME` 记录目标域名；使用 Actions 发布时，实际绑定以 GitHub Pages 设置为准，不能只修改这个文件。

当前域名通过阿里云 ESA 加速访问 GitHub Pages。以后调整 ESA 时，回源域名可指向 `thelucius7.github.io`，回源 Host 应为 `blog.lucius7.cn`，不要添加 `/blog/` 或 `/meow/` 路径前缀。若更新后仍显示旧内容，可在 ESA 刷新相应页面缓存。

更换域名时，需要同步修改 `site`、`public/CNAME`、GitHub Pages 绑定和 DNS/CDN 配置。域名只能绑定到一个 Pages 仓库，当前发布仓库为 `meow`。部署失败时，在 Actions 中打开对应运行记录查看失败步骤；成功发布前，网站继续提供上一次成功部署的版本。
