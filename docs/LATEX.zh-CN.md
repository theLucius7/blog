# 在文章中写 LaTeX 数学公式

项目沿用 Fuwari 的 `remark-math` + `rehype-katex` 配置，在构建时生成公式 HTML 和 MathML。KaTeX 样式及字体随网站一起发布，不需要额外添加 CDN 或浏览器渲染脚本。

编辑 `src/content/posts/` 下的 Markdown 文章，在 frontmatter（文件头的第二个 `---`）之后使用下面的写法。

## 行内公式

用一对 `$` 包住公式：

```markdown
质能方程为 $E = mc^2$，平方和为 $a^2 + b^2 = c^2$。
```

## 独立公式

开头和结尾的 `$$` 各占一行，公式块前后留空行：

```markdown
$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$
```

## 多行推导

使用 `aligned`，用 `&` 标记对齐点，用 `\\` 换行：

```markdown
$$
\begin{aligned}
(a+b)^2 &= a^2 + 2ab + b^2 \\
(a-b)^2 &= a^2 - 2ab + b^2
\end{aligned}
$$
```

## 矩阵

```markdown
$$
A = \begin{pmatrix}
1 & 2 \\
3 & 4
\end{pmatrix}
$$
```

## 分段函数

```markdown
$$
|x| = \begin{cases}
x, & x \ge 0 \\
-x, & x < 0
\end{cases}
$$
```

## 写作与预览

- 上面的代码框用于展示源码。复制框内内容到文章正文，公式才会渲染；放在普通代码块或反引号中会保留原文。
- Markdown 文件中的 LaTeX 命令使用单个反斜杠，例如 `\frac`；`\\` 用于矩阵或多行公式中的换行。
- 普通文本中的美元符号写成 `\$`，避免被当作公式分隔符。
- 采用 `$...$` 和 `$$` 分隔符；此 Markdown 配置不使用 `\(...\)` 或 `\[...\]`。
- 独立长公式可在公式区域横向滚动，也可以使用 `aligned` 手动拆行。
- 这里支持 KaTeX 的数学命令。完整 `.tex` 文档的 `\documentclass`、`\usepackage` 等不适用于文章正文；可用命令见官方支持表。
- 执行 `pnpm dev` 预览，执行 `pnpm check && pnpm build` 检查并构建。提交到 `main` 后 GitHub Pages 自动更新。

## 官方参考与配置位置

- [Fuwari 官方配置](https://github.com/saicaca/fuwari/blob/main/astro.config.mjs)：项目的 `astro.config.mjs` 已启用 `remarkMath` 与 `rehypeKatex`。
- [remark-math 文档](https://github.com/remarkjs/remark-math/tree/main/packages/remark-math)：Markdown 公式语法。
- [rehype-katex 文档](https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex)：构建时渲染与 CSS 要求。项目的 `src/layouts/Layout.astro` 已导入 `katex/dist/katex.css`。
- [KaTeX 支持的命令](https://katex.org/docs/supported.html)。
- [KaTeX 官方横向滚动样式](https://katex.org/docs/issues.html#css-customization)：项目在 `src/styles/markdown.css` 中应用。

现有 [Markdown 示例文章](https://blog.lucius7.cn/posts/markdown/) 可查看行内公式、积分和长公式的显示效果。
