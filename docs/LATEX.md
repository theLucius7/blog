# Writing LaTeX math in posts

The project uses Fuwari's `remark-math` and `rehype-katex` configuration to generate math HTML and MathML at build time. KaTeX styles and fonts ship with the site; no additional CDN or browser rendering script is needed.

Use the examples below in Markdown under `src/content/posts/zh/` or `src/content/posts/en/`, after the second frontmatter delimiter (`---`). See the [writing guide](WRITING.md) for new posts, images, and drafts. These examples belong to the documentation and are not published as posts.

## Inline math

Wrap an expression in a pair of `$` delimiters:

```markdown
The mass-energy relation is $E = mc^2$, and the Pythagorean theorem is $a^2 + b^2 = c^2$.
```

## Display math

Put the opening and closing `$$` on separate lines, with blank lines around the block:

```markdown
$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$
```

## Multiline derivations

Use `aligned`, `&` for alignment, and `\\` for line breaks:

```markdown
$$
\begin{aligned}
(a+b)^2 &= a^2 + 2ab + b^2 \\
(a-b)^2 &= a^2 - 2ab + b^2
\end{aligned}
$$
```

## Matrices

```markdown
$$
A = \begin{pmatrix}
1 & 2 \\
3 & 4
\end{pmatrix}
$$
```

## Piecewise functions

```markdown
$$
|x| = \begin{cases}
x, & x \ge 0 \\
-x, & x < 0
\end{cases}
$$
```

## Writing and previewing

- The code blocks above show source. Copy their contents into the post body to render the math; ordinary code fences and backticks preserve it as text.
- LaTeX commands in Markdown use one backslash, such as `\frac`. Use `\\` for line breaks in matrices and multiline expressions.
- Escape a literal dollar sign as `\$` so it is not interpreted as a math delimiter.
- Use `$...$` and `$$` delimiters. This Markdown configuration does not use `\(...\)` or `\[...\]`.
- Long display expressions scroll horizontally. Use `aligned` to split them manually if preferable.
- KaTeX math commands are supported. Full-document commands such as `\documentclass` and `\usepackage` do not apply to post bodies; consult the supported-command reference below.
- Use `pnpm dev` to preview math in drafts. Before publication, set `draft: false`, run `pnpm lint`, `pnpm check`, and `pnpm build`, then inspect production output with `pnpm preview`. Production builds exclude drafts.
- Follow the [publishing steps](DEPLOYMENT.md#regular-writing-and-publishing). GitHub Pages updates automatically after the PR is merged into `main`.

## References and configuration

- [Fuwari configuration](https://github.com/saicaca/fuwari/blob/main/astro.config.mjs): this project's `astro.config.mjs` enables `remarkMath` and `rehypeKatex`.
- [remark-math documentation](https://github.com/remarkjs/remark-math/tree/main/packages/remark-math): Markdown math syntax.
- [rehype-katex documentation](https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex): build-time rendering and CSS requirements. `src/layouts/Layout.astro` imports `katex/dist/katex.css`.
- [KaTeX supported commands](https://katex.org/docs/supported.html).
- [KaTeX horizontal scrolling styles](https://katex.org/docs/issues.html#css-customization): applied in `src/styles/markdown.css`.

Template example posts have been removed. To experiment, create a draft with `pnpm new-post en/math-notes`, copy these examples into the body, and preview with `pnpm dev`.
