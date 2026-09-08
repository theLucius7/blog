# Writing guide

Chinese posts live in `src/content/posts/zh/` and English posts in `src/content/posts/en/` and use standard Markdown (`.md`). MDX is not enabled, and the generator creates only `.md` files. Examples in this guide are documentation; they are not published as blog posts.

See the [README](../README.md#first-run) for installation and the [deployment guide](DEPLOYMENT.md) for publishing.

## Create a post

Run from the repository root:

```sh
pnpm new-post en/my-first-post
pnpm dev
```

The generator creates `src/content/posts/en/my-first-post.md` with `draft: true`, `lang: en`, and the current date. It does not overwrite existing files. Edit the title, date, and body, then open the development URL shown in the terminal. Preview it at the local `/en/` path.

Use lowercase English letters, numbers, and hyphens in filenames, such as `binary-search-notes`. The `title` field holds the display title; the filename organizes files and determines the default URL.

Use `pnpm new-post zh/my-first-post` for Chinese. Omitting the language prefix defaults to `zh/`. Markdown must be inside `zh/` or `en/`; the build rejects posts directly in `posts/` or other language directories.

Matching relative paths, such as `zh/my-first-post.md` and `en/my-first-post.md`, identify translations automatically. They can publish independently. See [Bilingual content](I18N.md) for pairing, switching languages, and search.

## Single files and post directories

A short post can use one file:

```text
src/content/posts/en/
└── binary-search-notes.md
```

Its URL is `/en/posts/binary-search-notes/`.

For posts with several images, create a directory:

```sh
pnpm new-post en/binary-search-notes/index
```

Keep the images alongside the post:

```text
src/content/posts/en/
└── binary-search-notes/
    ├── index.md
    ├── cover.png
    └── steps.png
```

Chinese posts use `/zh/posts/…/`. This English `index.md` also maps to `/en/posts/binary-search-notes/`. A nested file such as `notes/binary-search.md` maps to `/en/posts/notes/binary-search/`. Do not keep both `binary-search-notes.md` and `binary-search-notes/index.md`; they produce the same default URL.

URLs derive from paths, with a trailing `/index` removed. Avoid renaming published files or directories because saved links may break. Changing only `title` does not change the URL.

## Frontmatter

Each post starts with YAML between two `---` lines. The body follows the second delimiter:

```markdown
---
title: "Binary search: boundaries and loop conditions"
published: 2026-09-08
updated: 2026-09-09
description: "Interval conventions and common boundary errors in binary search."
image: ./cover.png
tags: [algorithms, binary-search]
category: Study notes
draft: true
lang: en
---

## The problem

Start the body here.
```

This example assumes `cover.png` exists in the post directory. Use `image: ''` if there is no cover. The optional `updated` field records later revisions; remove the entire line when unused.

| Field | Format and purpose |
| --- | --- |
| `title` | Required title; quote values containing characters such as colons |
| `published` | Required publication date as unquoted `YYYY-MM-DD`; lists sort newest first |
| `updated` | Optional latest revision date in the same format; remove it instead of leaving it empty |
| `description` | Short summary; use an empty string when omitted |
| `image` | Cover path, or `''` for no cover; see the image rules below |
| `tags` | Array such as `[algorithms, notes]`; use `[]` for no tags |
| `category` | One category name; an empty string uses the uncategorized group |
| `draft` | Boolean `true` for drafts or `false` for publication; do not quote it |
| `lang` | Optional; inferred from the directory. Chinese accepts `zh_CN`, `zh`, or `zh-CN`; English uses `en`. Conflicts with the directory are rejected |
| `translationKey` | Optional shared identifier for translations; defaults to the post path without the language prefix |

Do not set `prevTitle`, `prevSlug`, `nextTitle`, or `nextSlug`; the application generates them. Keep YAML indentation consistent, use valid dates, and represent tags as an array rather than a comma-separated string.

## Images

### In the post directory

For `src/content/posts/en/binary-search-notes/index.md`, put `cover.png` and `steps.png` in the same directory:

```yaml
image: ./cover.png
```

Use standard Markdown for body images:

```markdown
![How the binary search interval changes](./steps.png)
```

`./` is relative to the current Markdown file. The site processes local images referenced within `src/`. Move images with their post or update the relative paths.

### In public

Put shared images or images needing stable public URLs in a path such as `public/images/diagram.png`:

```yaml
image: /images/diagram.png
```

```markdown
![Flowchart](/images/diagram.png)
```

Start the URL with `/images/`; **do not include `/public/`**. Files in `public/` are published unchanged, without Astro image optimization. This site uses a custom domain's root, so do not add `/blog/` or `/meow/`.

Body images can also use full remote HTTPS URLs. If an image fails to load, check filename case and whether the file was committed. Local filesystems may ignore case, while Linux in GitHub Actions is case-sensitive. See [Astro's image documentation](https://v5.docs.astro.build/en/guides/images/#images-in-markdown-files).

## Text, code, and math

The site displays `title` automatically, so the body normally starts with a level-two heading (`##`). Lists, quotes, links, tables, and fenced code blocks with language labels are supported:

````markdown
## Example

- First item
- Second item

[Browse the archive](/en/archive/)

```python
print("Hello, world!")
```
````

Link to posts through their page URLs, such as `/en/posts/binary-search-notes/`, rather than local Markdown paths.

Inline math:

```markdown
The mass-energy relation is $E = mc^2$.
```

For display math, put each `$$` delimiter on its own line:

```markdown
$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$
```

See the [LaTeX guide](LATEX.md) for matrices, multiline derivations, piecewise functions, and troubleshooting.

## Drafts and production previews

| Context | `draft: true` | `draft: false` |
| --- | --- | --- |
| `pnpm dev` | Visible | Visible |
| `pnpm preview` after `pnpm build` | No post page generated | Post page generated |
| GitHub Pages | Not published | Published after merging into `main` |

The generator creates drafts by default. Include `draft` explicitly in manually written posts too: the current schema defaults an omitted field to `false`. Draft status controls generated pages; Markdown pushed to this public repository remains visible on GitHub.

`published` controls the displayed date and sorting. **A future date does not delay publication.** Keep unfinished posts at `draft: true`, then set `false` when ready.

Development mode does not provide the final Pagefind experience. To inspect search and production output, run:

```sh
pnpm lint
pnpm check
pnpm build
pnpm preview
```

Stop `pnpm dev` with `Ctrl+C` before starting the production preview if needed. The preview does not rebuild automatically. With no public posts, the home page shows an empty state and the archive and search have no post results.

## Update an existing post

Sync `main`, create a branch, and edit the relevant Markdown and assets. Set `updated` for substantive revisions; normally retain the original `published` date and path. Set `draft: true` to remove a post from the published site temporarily. To delete it entirely, remove its Markdown and any dedicated images that are no longer used.

Validate, commit, and merge a PR as described in [Regular writing and publishing](DEPLOYMENT.md#regular-writing-and-publishing).

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| A post appears locally but disappears after a build | Check whether `draft` is still `true` |
| The build reports an empty post collection | Expected with an empty initial directory; confirm the build completes successfully |
| No posts on the home page | Expected until the first `draft: false` post is published |
| Frontmatter validation fails | Check title, valid dates, tag arrays, booleans, and YAML indentation |
| `Image file not found` or image 404 | Check relative paths, filename case, omitted `/public/` prefix, and whether images are committed |
| Language or translation-key conflict | Check that the post is inside `zh/` or `en/`, `lang` matches its directory, and its translation key is unique within the language |
| Two posts have conflicting URLs | Look for both `name.md` and `name/index.md`, or other normalized path collisions |
| Math appears as raw text | Check whether it is inside a code block and whether display delimiters have their own lines |
| Search requests a build or finds nothing | Use `pnpm build` and `pnpm preview`; confirm a public post contains the query |
| Local edits do not appear online | Confirm the PR was merged and Pages deployment succeeded, then check ESA caching |
