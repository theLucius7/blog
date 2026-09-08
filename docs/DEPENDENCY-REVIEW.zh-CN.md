# 依赖安全复核记录

复核日期：2026-09-08。环境：Node.js 22.23.2、pnpm 9.14.4。审计命令为 `pnpm audit --prod --json`；结果随公告数据库变化，应以再次执行的结果为准。

本项目把静态构建工具也列在 `dependencies` 中，所以 `--prod` 报告包含构建和开发工具。告警数量不等于线上可利用漏洞数量；是否可触发还取决于调用路径和输入来源。

## 本次处理

在合并 Astro、Swup、Markdown-it 的更新后，审计报告有 105 条：2 critical、57 high、39 moderate、7 low。本次兼容更新后降为 11 条：0 critical、4 high、4 moderate、3 low。

- 升级 `astro-icon` 至 1.2.0。其新版 Iconify 工具链移除旧 `extract-zip`、`axios`、`form-data` 等路径，并更新归档处理依赖；[官方发布说明](https://github.com/natemoo-re/astro-icon/releases/tag/astro-icon%401.2.0)明确列出相关修复。要求的 Node.js 22.12 与本仓库一致。
- 升级 Svelte 至 5.57.0，纳入 Svelte 5 的 SSR 属性和内容绑定修复。
- 在既有 `package.json` 兼容范围内重新解析锁文件，更新 PostCSS、Babel、glob、minimatch、brace-expansion 等传递依赖。未添加跨版本覆盖规则；Astro 仍为 5.18.2，渲染器与插件仍遵循已有分组约定。

验证包括冻结锁文件安装、lint、Astro/TypeScript 检查、构建和 Pagefind，以及 Chromium 中的公式、代码块、RSS、Swup 导航、桌面与手机搜索、明暗模式、主题色与重置、归档标签筛选。临时文章仅用于验证，不提交或发布。

## 剩余告警的适用范围

| 来源 | 数量 | 当前调用范围与后续处理 |
| --- | --- | --- |
| Astro 5.18.2 | 8：2 high、4 moderate、2 low | 公告涉及服务端请求、Server Islands、动态属性、插槽和 View Transition 的转义。当前发布纯静态文件，没有服务端适配器或 Server Islands；`define:vars` 来自仓库配置与常量，插槽名固定。未发现公开请求控制这些渲染参数的路径。静态部署本身不能阻止被污染的构建数据触发转义缺陷；当前判断依据是构建输入受仓库审阅控制。公告修复横跨 Astro 6/7，完整覆盖需至少 Astro 7.1；应单独迁移旧内容集合并验证集成、RSS、搜索和页面，不能只改版本号。 |
| Sharp 0.34.5 / libvips | 1 high | 用于构建时处理仓库内图片；当前腾讯头像走普通远程 `img`。不提供公开图片上传或在线转换接口。公告 API 将首修版本标记为 0.35.0；使用预编译二进制时，迁移至少采用 0.35.3（libvips 8.18.3）。升级时需一起核对 Astro 的 Sharp 依赖，避免只更新直接依赖后仍保留旧解析器。 |
| `@swup/astro` → 旧 Swup 插件 → microbundle → `serialize-javascript` 4 | 1 high | 旧插件把构建工具带入了依赖树。站点脚本执行 Astro、Biome 和 Pagefind，不执行 microbundle；浏览器使用插件已发布的代码。应随父插件更新或替换这条构建链。修复版本至少为 7.0.3，不强制把旧工具链的 4.x 覆盖为 7.x。 |
| Astro → esbuild 0.27.7 | 1 low | 公告针对 Windows 上 esbuild 自身 `serve` / `servedir` 的任意文件读取。当前 Astro 只调用其 `build` / `transform`，没有调用该服务接口；Pages 只部署静态产物。修复要求 esbuild 0.28.1，随兼容的 Astro 工具链迁移处理。 |

相关公告：[Astro Host 请求](https://github.com/advisories/GHSA-2pvr-wf23-7pc7)、[Astro 插槽](https://github.com/advisories/GHSA-8hv8-536x-4wqp)、[Astro 属性转义](https://github.com/advisories/GHSA-f48w-9m4c-m7f5)、[Astro View Transition](https://github.com/advisories/GHSA-4g3v-8h47-v7g6)、[Sharp/libvips](https://github.com/advisories/GHSA-f88m-g3jw-g9cj)、[serialize-javascript](https://github.com/advisories/GHSA-5c6j-r48x-rmvq)、[esbuild](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr)。

以上是当前代码和部署方式的适用性判断，不代表未修补版本已消除缺陷。接入服务端渲染、用户上传、外部不可信内容或开放开发服务器前，必须重新检查输入路径并优先完成相应升级。

## 后续复核

依赖变更时同时检查公告、父依赖约束和实际用途。锁文件重算应在独立分支完成，用 `pnpm install --frozen-lockfile` 验证可复现性；不能用忽略公告或跨大版本覆盖来让数字归零。版本迁移按 [贡献约定](../CONTRIBUTING.md)运行当前提交的检查，合并后确认主线 CI、Pages 和线上页面。
