# Dependency security review

Review date: September 8, 2026. Environment: Node.js 22.23.2 and pnpm 9.14.4. Audit command: `pnpm audit --prod --json`. Results change with the advisory database; rerun the command for a current result.

This project lists static build tools in `dependencies`, so the production audit includes build and development tools. The alert count is not the count of exploitable live-site vulnerabilities: applicability depends on call paths and input sources.

## Completed updates

After the Astro, Swup, and Markdown-it updates, the audit reported 105 findings: 2 critical, 57 high, 39 moderate, and 7 low. Compatible updates reduced that to 11: 0 critical, 4 high, 4 moderate, and 3 low.

- Updated `astro-icon` to 1.2.0. Its newer Iconify toolchain removes old dependency paths through `extract-zip`, `axios`, and `form-data`, and updates archive-processing dependencies. The [official release notes](https://github.com/natemoo-re/astro-icon/releases/tag/astro-icon%401.2.0) list the fixes. Its Node.js 22.12 requirement matches this repository.
- Updated Svelte to 5.57.0, including fixes for SSR attributes and content bindings in Svelte 5.
- Resolved the lockfile again within the existing `package.json` ranges, updating transitive dependencies including PostCSS, Babel, glob, minimatch, and brace-expansion. No cross-version overrides were added. Astro remains at 5.18.2, and renderers and plugins retain the existing grouping conventions.

Validation covered frozen-lockfile installation, lint, Astro/TypeScript checks, the build, and Pagefind. Chromium checks covered math, code blocks, RSS, Swup navigation, desktop and mobile search, light and dark modes, theme color and reset, and archive tag filtering. Temporary posts were used only for validation and were neither committed nor published.

## Applicability of remaining findings

| Source | Count | Current exposure and follow-up |
| --- | --- | --- |
| Astro 5.18.2 | 8: 2 high, 4 moderate, 2 low | Advisories concern server requests, Server Islands, dynamic attributes, slots, and View Transition escaping. The current site publishes static files without a server adapter or Server Islands. `define:vars` comes from repository configuration and constants, and slot names are fixed. No path was found for public requests to control those rendering inputs. Static deployment alone does not prevent poisoned build data from triggering escaping defects; this assessment relies on repository review controlling build inputs. Fixes span Astro 6 and 7, with complete coverage requiring at least Astro 7.1. Migrate the legacy content collections and validate integrations, RSS, search, and pages separately; changing the version number alone is insufficient. |
| Sharp 0.34.5 / libvips | 1 high | Used at build time for repository images. The Tencent avatar currently uses a normal remote `img`. There is no public image-upload or online-conversion endpoint. The advisory API identifies 0.35.0 as the first fixed version; when using prebuilt binaries, migrate to at least 0.35.3 with libvips 8.18.3. Check Astro's Sharp dependency too, so updating the direct dependency does not leave an older parser installed. |
| `@swup/astro` → older Swup plugins → microbundle → `serialize-javascript` 4 | 1 high | Older plugins bring build tools into the dependency tree. Site scripts run Astro, Biome, and Pagefind, not microbundle; the browser uses the plugins' published code. Update or replace this build chain through the parent plugins. The fixed version is at least 7.0.3; do not force the older toolchain's 4.x dependency to 7.x with an override. |
| Astro → esbuild 0.27.7 | 1 low | The advisory concerns arbitrary file reads through esbuild's own `serve` / `servedir` on Windows. Astro currently calls `build` / `transform`, not that server interface, and Pages deploys static output only. The fix requires esbuild 0.28.1; handle it through a compatible Astro toolchain migration. |

Related advisories: [Astro Host requests](https://github.com/advisories/GHSA-2pvr-wf23-7pc7), [Astro slots](https://github.com/advisories/GHSA-8hv8-536x-4wqp), [Astro attribute escaping](https://github.com/advisories/GHSA-f48w-9m4c-m7f5), [Astro View Transition](https://github.com/advisories/GHSA-4g3v-8h47-v7g6), [Sharp/libvips](https://github.com/advisories/GHSA-f88m-g3jw-g9cj), [serialize-javascript](https://github.com/advisories/GHSA-5c6j-r48x-rmvq), and [esbuild](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr).

This is an applicability assessment of the reviewed code and deployment, not a claim that defects in unpatched versions have been eliminated. Before introducing server rendering, user uploads, untrusted external content, or a publicly accessible development server, reassess input paths and prioritize the relevant upgrades.

## Future reviews

Review advisories, parent dependency constraints, and actual usage together when dependencies change. Recalculate lockfiles on a dedicated branch and confirm reproducibility with `pnpm install --frozen-lockfile`. Do not ignore advisories or force major-version overrides merely to reduce the count to zero. Follow [CONTRIBUTING.md](../CONTRIBUTING.md) to validate the current migration commit, then verify main-branch CI, Pages deployment, and the live site after merging.
