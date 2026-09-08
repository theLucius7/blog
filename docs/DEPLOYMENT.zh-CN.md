# 博客使用与部署

网站地址：<https://thelucius7.github.io/meow/>

## 本地预览

使用 Node.js 22 和项目指定的 pnpm 9.14.4。在仓库根目录执行：

```sh
npm install -g pnpm@9.14.4
pnpm install --frozen-lockfile
pnpm dev
```

打开终端显示的网址，默认是 <http://localhost:4321/meow/>。

## 写文章

```sh
pnpm new-post my-first-post
```

编辑 `src/content/posts/my-first-post.md`：设置标题、日期、分类和标签，然后在文件头的第二个 `---` 下方写正文。准备发布时设为 `draft: false`。

博客名称、语言、头像和个人介绍在 `src/config.ts` 中配置；关于页面在 `src/content/spec/about.md`。当前保留 Fuwari 模板的示例内容和外观。

## 发布更新

```sh
pnpm build
pnpm preview
```

预览确认后，提交修改并推送到 `main`。GitHub Actions 中的 **Deploy to GitHub Pages** 会自动构建并发布网站，也可以手动运行。构建使用 `pnpm build`，同时生成静态页面和 Pagefind 搜索索引。

在仓库的 **Settings → Pages** 中，发布来源应为 **GitHub Actions**。

当前 `astro.config.mjs` 设置为：

```js
site: "https://thelucius7.github.io/",
base: "/meow/",
```

若将来修改仓库名或绑定独立域名，需要同步调整这两个字段。部署失败时，在 Actions 中打开对应运行记录查看失败步骤；成功发布前，网站继续提供上一次成功部署的版本。
