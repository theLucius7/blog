#!/usr/bin/env node
/**
 * Build-level regression tests for the two-language blog.
 *
 * Run after pnpm install: pnpm test:i18n
 * --keep-temp preserves a ready-to-preview fixture site and the build logs.
 * --build-only skips generator/error cases; --build-script NAME replaces build.
 *
 * The real content and dist directories are never changed. Dependencies are
 * linked into a source snapshot, with Astro/Vite caches kept in that snapshot.
 * Real browser search and language-switch interactions are separate UI checks.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const options = { keepTemp: false, buildOnly: false, buildScript: "build" };
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === "--keep-temp") options.keepTemp = true;
  else if (arg === "--build-only") options.buildOnly = true;
  else if (arg === "--build-script" && process.argv[i + 1]) options.buildScript = process.argv[++i];
  else if (arg === "--help" || arg === "-h") {
    console.log("Usage: pnpm test:i18n [--keep-temp] [--build-only] [--build-script NAME]");
    process.exit(0);
  } else {
    console.error(`Unknown or incomplete option: ${arg}`);
    process.exit(1);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(sourceRoot, "package.json"), "utf8"));
assert(packageJson.scripts[options.buildScript], `Unknown build script: ${options.buildScript}`);
assert(!packageJson.scripts[options.buildScript].includes("test-i18n"), "The build script must not call this test recursively");
assert(fs.existsSync(path.join(sourceRoot, "node_modules")), "Run pnpm install before these tests");
const site = new URL(packageJson.homepage);
const locales = { zh: "zh-CN", en: "en" };
const tempRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "blog-i18n-")));
const postsRoot = path.join(tempRoot, "src/content/posts");
const dist = path.join(tempRoot, "dist");
const logs = path.join(tempRoot, "test-logs");
let child;
let interrupted = false;
let assertions = 0;

function check(value, message) {
  assertions++;
  assert(value, message);
}

function stopChild() {
  interrupted = true;
  if (!child) return;
  try {
    if (process.platform === "win32") child.kill("SIGTERM");
    else process.kill(-child.pid, "SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}
process.once("SIGINT", stopChild);
process.once("SIGTERM", stopChild);

function snapshot() {
  const excluded = new Set([".git", "node_modules", "dist", ".astro", ".vite", ".cache", "test-logs"]);
  for (const entry of fs.readdirSync(sourceRoot)) {
    if (excluded.has(entry)) continue;
    fs.cpSync(path.join(sourceRoot, entry), path.join(tempRoot, entry), { recursive: true });
  }
  // Linking node_modules itself would share node_modules/.astro with the author.
  fs.mkdirSync(path.join(tempRoot, "node_modules"));
  for (const entry of fs.readdirSync(path.join(sourceRoot, "node_modules"))) {
    if ([".astro", ".vite", ".cache"].includes(entry)) continue;
    const target = fs.realpathSync(path.join(sourceRoot, "node_modules", entry));
    const linkType = process.platform === "win32" ? (fs.statSync(target).isDirectory() ? "junction" : "file") : undefined;
    fs.symlinkSync(target, path.join(tempRoot, "node_modules", entry), linkType);
  }
  fs.mkdirSync(logs);
  resetPosts();
}

function resetPosts() {
  // postsRoot is always inside the temporary snapshot, never the source tree.
  fs.rmSync(postsRoot, { recursive: true, force: true });
  for (const locale of Object.keys(locales)) fs.mkdirSync(path.join(postsRoot, locale), { recursive: true });
}

async function run(command, args, label) {
  if (interrupted) throw new Error("Tests interrupted");
  console.log(`→ ${label}`);
  const result = await new Promise((resolve, reject) => {
    let output = "";
    child = spawn(command, args, {
      cwd: tempRoot,
      env: { ...process.env, CI: "true", NO_COLOR: "1", ASTRO_TELEMETRY_DISABLED: "1" },
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const timer = setTimeout(() => stopChild(), 180_000);
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    child.once("error", (error) => { clearTimeout(timer); child = undefined; reject(error); });
    child.once("close", (code, signal) => {
      clearTimeout(timer);
      child = undefined;
      resolve({ code, signal, output });
    });
  });
  fs.writeFileSync(path.join(logs, `${label.replace(/[^a-z0-9-]/gi, "-")}.log`), result.output);
  if (interrupted) throw new Error(`Interrupted or timed out during ${label}`);
  return result;
}

async function build(label, expectedError) {
  const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const result = await run(command, ["run", options.buildScript], label);
  const tail = result.output.split("\n").slice(-35).join("\n");
  if (expectedError) {
    check(result.code !== 0, `${label}: invalid content unexpectedly built successfully`);
    check(expectedError.test(result.output), `${label}: failed for an unrelated reason\n${tail}`);
  } else {
    check(result.code === 0, `${label}: build failed\n${tail}`);
  }
}

function decode(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#39);/g, (entity) => ({
    "&amp;": "&", "&quot;": '"', "&apos;": "'", "&#39;": "'", "&lt;": "<", "&gt;": ">",
  })[entity]);
}

// We inspect generated tags/attributes, without depending on theme class names.
function tags(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, "gi"))].map((match) => {
    const attributes = {};
    for (const attr of match[1].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attributes[attr[1].toLowerCase()] = decode(attr[2] ?? attr[3] ?? attr[4] ?? "");
    }
    return attributes;
  });
}

function routeFile(route) {
  return path.join(dist, route.replace(/^\//, ""), route.endsWith("/") ? "index.html" : "");
}

function readRoute(route) {
  const file = routeFile(route);
  check(fs.existsSync(file), `Missing generated route ${route}`);
  return fs.readFileSync(file, "utf8");
}

function localPath(href, base = site) {
  const target = new URL(href, base);
  return target.origin === site.origin ? target.pathname : undefined;
}

function links(html, route) {
  return tags(html, "a").filter((tag) => tag.href).map((tag) => new URL(tag.href, new URL(route, site)));
}

function metadata(route, locale) {
  const html = readRoute(route);
  const linkTags = tags(html, "link");
  check(tags(html, "html")[0]?.lang === locales[locale], `${route}: wrong html lang`);
  const canonical = linkTags.find((tag) => tag.rel === "canonical");
  check(canonical?.href === new URL(route, site).href, `${route}: canonical must use its own public URL`);
  const ogUrl = tags(html, "meta").find((tag) => tag.property === "og:url");
  check(ogUrl?.content === new URL(route, site).href, `${route}: og:url must match canonical`);
  check(linkTags.some((tag) => tag.type === "application/rss+xml" && localPath(tag.href) === `/${locale}/rss.xml`), `${route}: wrong RSS discovery link`);
  return html;
}

function checkFeed(locale, expectedPosts) {
  const route = `/${locale}/rss.xml`;
  const xml = readRoute(route);
  const language = xml.match(/<language>([^<]+)<\/language>/)?.[1].toLowerCase().replaceAll("_", "-");
  check(language === locales[locale].toLowerCase(), `${route}: wrong feed language`);
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
  check(items.length === expectedPosts.length, `${route}: expected ${expectedPosts.length} items, got ${items.length}`);
  const expectedUrls = new Set(expectedPosts.map((post) => post.route));
  for (const item of items) {
    const href = decode(item.match(/<link>([^<]+)<\/link>/)?.[1] ?? "");
    check(expectedUrls.delete(localPath(href)), `${route}: duplicate, foreign, or unexpected item ${href}`);
  }
  check(expectedUrls.size === 0, `${route}: missing published posts`);
  check(!xml.includes("draftqueryneedle"), `${route}: draft content leaked`);
  const other = locale === "zh" ? "en" : "zh";
  check(!xml.includes(`${other}OnlyTag`) && !xml.includes(`${other}OnlyCategory`) && !xml.includes(`${other}OnlyDescription`), `${route}: opposite-language metadata leaked`);
}

function searchFragments() {
  const entry = JSON.parse(fs.readFileSync(path.join(dist, "pagefind/pagefind-entry.json"), "utf8"));
  check(entry.languages["zh-cn"] && entry.languages.en, "Pagefind must build both zh-cn and en indexes");
  const directory = path.join(dist, "pagefind/fragment");
  const fragments = fs.readdirSync(directory).filter((name) => name.endsWith(".pf_fragment")).map((name) => {
    // Pagefind 1.x emits gzip JSON fragments prefixed with its format signature.
    // A future format change should fail here, so index checks are never skipped.
    const text = gunzipSync(fs.readFileSync(path.join(directory, name))).toString();
    check(text.startsWith("pagefind_dcd{"), `Unsupported Pagefind fragment format: ${name}`);
    return { name, ...JSON.parse(text.slice("pagefind_dcd".length)) };
  });
  for (const fragment of fragments) {
    const route = localPath(fragment.url);
    check(/^\/(zh|en)\//.test(route ?? ""), `Search indexed a nonlocalized page: ${fragment.url}`);
    const locale = route.split("/")[1];
    check(fragment.name.startsWith(`${locales[locale].toLowerCase()}_`), `Search assigned ${route} to the wrong language`);
    check(!fragment.content.includes("draftqueryneedle"), "Search indexed a draft");
  }
  return fragments;
}

function verifyEmpty() {
  for (const locale of Object.keys(locales)) {
    const home = metadata(`/${locale}/`, locale);
    const archive = metadata(`/${locale}/archive/`, locale);
    metadata(`/${locale}/about/`, locale);
    for (const [route, html] of [[`/${locale}/`, home], [`/${locale}/archive/`, archive]]) {
      check(html.includes(locale === "en" ? "No posts yet" : "还没有文章"), `${route}: missing localized empty state`);
      check(!links(html, route).some((link) => /\/(zh|en)\/posts\//.test(link.pathname)), `${route}: empty blog contains article links`);
    }
    checkFeed(locale, []);
  }
  check(searchFragments().every((fragment) => !/\/posts\//.test(fragment.url)), "Empty site retained old posts in search");
}

async function testGenerator() {
  const cases = [["zh/generated", "zh/generated.md"], ["en/generated", "en/generated.md"], ["default-post", "zh/default-post.md"], ["en/nested/index", "en/nested/index.md"]];
  for (const [argument, relative] of cases) {
    const result = await run(process.execPath, ["scripts/new-post.js", argument], `new-post-${argument}`);
    check(result.code === 0, `new-post ${argument}: ${result.output}`);
    const file = path.join(postsRoot, relative);
    check(fs.existsSync(file), `new-post ${argument}: expected ${relative}`);
    const content = fs.readFileSync(file, "utf8");
    check(/^draft:\s*true\s*$/m.test(content), `new-post ${argument}: must start as a draft`);
    const explicitLang = content.match(/^lang:\s*['"]?([\w-]+)/m)?.[1];
    check(!explicitLang || (relative.startsWith("en/") ? explicitLang === "en" : /^zh(?:[-_]CN)?$/.test(explicitLang)), `new-post ${argument}: wrong explicit language`);
  }
  const existing = path.join(postsRoot, "en/generated.md");
  const before = fs.readFileSync(existing, "utf8");
  const duplicate = await run(process.execPath, ["scripts/new-post.js", "en/generated"], "new-post-no-overwrite");
  check(duplicate.code !== 0 && fs.readFileSync(existing, "utf8") === before, "new-post overwrote an existing article");
  for (const argument of ["en/index", "../escaped", "en/../../escaped"]) {
    const result = await run(process.execPath, ["scripts/new-post.js", argument], `new-post-reject-${argument}`);
    check(result.code !== 0, `new-post should reject ${argument}`);
  }
  resetPosts();
}

const fixtures = [];
const coverPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEklEQVR4nGMQqbgjUnGHAUIBACROBaFrvauWAAAAAElFTkSuQmCC", "base64");

function writePost(locale, file, fields, body = "") {
  const target = path.join(postsRoot, locale, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const frontmatter = Object.entries(fields).map(([key, value]) => {
    // YAML dates are unquoted so the same z.date schema as authored posts runs.
    const serialized = ["published", "updated"].includes(key) ? value : JSON.stringify(value);
    return `${key}: ${serialized}`;
  }).join("\n");
  fs.writeFileSync(target, `---\n${frontmatter}\n---\n\n${body}\n`);
  return target;
}

function seedFixtures() {
  for (const locale of Object.keys(locales)) {
    const files = [locale === "zh" ? "translated-chinese.md" : "translated-english.md", "same-slug.md", `${locale}-only.md`, "nested/guide/index.md", ...Array.from({ length: 6 }, (_, index) => `pagination-${index + 1}.md`)];
    for (const [index, file] of files.entries()) {
      const slug = file.replace(/(?:\/index)?\.md$/, "");
      const title = `${locale.toUpperCase()}RegressionTitle${index + 1}`;
      const token = `${locale}queryexclusive${index + 1}needle`;
      const published = `2024-01-${String(index * 2 + (locale === "zh" ? 1 : 2)).padStart(2, "0")}`;
      const fields = { title, published, draft: false, tags: [`${locale}OnlyTag`], category: `${locale}OnlyCategory`, description: `${locale}OnlyDescription ${token}` };
      // Most posts omit lang: the content directory must remain authoritative.
      if (index === 0) fields.translationKey = "different-slug-pair";
      if (index === 1) fields.lang = locales[locale];
      if (index === 3) fields.image = "./cover.png";
      const body = `## Fixture Heading\n\n${token} ${locale}queryexclusiveneedle bilingualsharedneedle\n\n:::note\nA formula inside a directive: $E=mc^2$.\n:::\n\n${index === 3 ? "![Local fixture cover](./cover.png)\n" : ""}`;
      const target = writePost(locale, file, fields, body);
      if (index === 3) fs.writeFileSync(path.join(path.dirname(target), "cover.png"), coverPng);
      fixtures.push({ locale, slug, title, token, published, route: `/${locale}/posts/${slug}/` });
    }
    writePost(locale, "hidden-draft.md", { title: `${locale}HiddenDraft`, published: "2024-02-01", draft: true, tags: ["draftOnlyTag"], category: "draftOnlyCategory" }, "draftqueryneedle bilingualsharedneedle");
  }
}

function counterpart(post) {
  const other = post.locale === "zh" ? "en" : "zh";
  const slug = post.slug.startsWith("translated-") ? (other === "zh" ? "translated-chinese" : "translated-english") : post.slug;
  return fixtures.find((candidate) => candidate.locale === other && candidate.slug === slug);
}

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith(".html") ? [file] : [];
  });
}

function verifyFixtures() {
  for (const locale of Object.keys(locales)) {
    const other = locale === "zh" ? "en" : "zh";
    const own = fixtures.filter((post) => post.locale === locale).sort((a, b) => b.published.localeCompare(a.published));
    const homeRoutes = htmlFiles(path.join(dist, locale)).map((file) => `/${path.relative(dist, path.dirname(file)).split(path.sep).join("/")}/`).filter((route) => new RegExp(`^/${locale}/(?:\\d+/)?$`).test(route));
    check(homeRoutes.length > 1, `/${locale}/: fixture articles did not produce pagination`);
    const listed = new Set();
    for (const route of [...homeRoutes, `/${locale}/archive/`]) {
      const html = metadata(route, locale);
      check(!html.includes(`${other}OnlyTag`) && !html.includes(`${other}OnlyCategory`) && !html.includes(`${other}OnlyDescription`), `${route}: opposite-language metadata leaked`);
      check(html.includes(`${locale}OnlyTag`) && html.includes(`${locale}OnlyCategory`), `${route}: own-language filters missing`);
      check(!html.includes("HiddenDraft") && !html.includes("draftOnlyTag"), `${route}: a draft leaked into lists or filters`);
      for (const link of links(html, route)) {
        if (link.origin === site.origin && ["tag", "category", "uncategorized"].some((key) => link.searchParams.has(key))) {
          check(link.pathname === `/${locale}/archive/`, `${route}: filter link escaped its language: ${link.href}`);
        }
        if (link.origin !== site.origin || !/\/posts\//.test(link.pathname)) continue;
        check(link.pathname.startsWith(`/${locale}/posts/`), `${route}: foreign article link ${link.pathname}`);
        if (homeRoutes.includes(route)) listed.add(link.pathname);
      }
    }
    for (const post of own) check(listed.has(post.route), `Pagination lost ${post.route}`);
    check(listed.size === own.length, `/${locale}/: pagination includes unexpected posts`);
    checkFeed(locale, own);
    for (const [index, post] of own.entries()) {
      const html = metadata(post.route, locale);
      check(html.includes(post.token) && html.includes("bilingualsharedneedle"), `${post.route}: article body missing`);
      check(!html.includes(`${other}OnlyTag`) && !html.includes(`${other}OnlyCategory`), `${post.route}: sidebar filters crossed languages`);
      const data = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap((match) => JSON.parse(match[1]));
      check(data.some((item) => item["@type"] === "BlogPosting" && item.inLanguage === locales[locale]), `${post.route}: wrong BlogPosting language`);
      const translated = counterpart(post);
      const alternates = tags(html, "link").filter((tag) => tag.rel === "alternate" && tag.hreflang);
      if (translated) check(alternates.some((tag) => tag.hreflang === locales[other] && localPath(tag.href) === translated.route), `${post.route}: translation pairing failed`);
      else check(!alternates.some((tag) => tag.hreflang === locales[other]), `${post.route}: advertises a nonexistent translation`);
      const articleLinks = links(html, post.route).filter((link) => link.origin === site.origin);
      for (const link of articleLinks.filter((link) => /\/posts\//.test(link.pathname))) {
        check(link.pathname.startsWith(`/${locale}/posts/`) || link.pathname === translated?.route, `${post.route}: unrelated foreign article link ${link.pathname}`);
        check(fs.existsSync(routeFile(link.pathname)), `${post.route}: broken article link ${link.pathname}`);
      }
      for (const neighbor of [own[index - 1], own[index + 1]].filter(Boolean)) {
        check(articleLinks.some((link) => link.pathname === neighbor.route), `${post.route}: missing same-language adjacent post ${neighbor.route}`);
      }
      check(articleLinks.some((link) => link.pathname === (translated?.route ?? `/${other}/`)), `${post.route}: language switch does not point to the translation or fallback home`);
      if (post.slug === "nested/guide") {
        const imageSources = tags(html, "img").flatMap((tag) => [tag.src, ...(tag.srcset?.split(",").map((item) => item.trim().split(/\s+/)[0]) ?? [])]).filter(Boolean).map((src) => new URL(src, new URL(post.route, site))).filter((url) => url.origin === site.origin);
        check(imageSources.length > 0, `${post.route}: local cover/body image is missing`);
        for (const image of imageSources) check(fs.existsSync(path.join(dist, decodeURIComponent(image.pathname))), `${post.route}: missing image asset ${image.pathname}`);
      }
    }
    check(!fs.existsSync(routeFile(`/${locale}/posts/hidden-draft/`)), `${locale}: draft generated a public route`);
    check(!fs.existsSync(routeFile(`/${locale}/posts/${locale}/same-slug/`)), `${locale}: locale prefix was duplicated in article URLs`);
  }
  const fragments = searchFragments();
  for (const post of fixtures) {
    const matches = fragments.filter((fragment) => localPath(fragment.url) === post.route);
    check(matches.length === 1, `Search must index ${post.route} exactly once`);
    const content = matches[0].content.replaceAll("\u200b", "");
    check(content.includes(post.token) && content.includes("bilingualsharedneedle"), `${post.route}: search content is incomplete`);
    const other = post.locale === "zh" ? "en" : "zh";
    check(!content.includes(`${other}queryexclusive`), `${post.route}: search content mixed languages`);
  }
}

try {
  console.log(`Isolated i18n test project: ${tempRoot}`);
  snapshot();
  if (!options.buildOnly) await testGenerator();
  await build("empty-bilingual-site");
  verifyEmpty();
  seedFixtures();
  if (!options.buildOnly) {
    const invalidLang = writePost("zh", "invalid-language.md", { title: "Invalid language", published: "2024-01-01", lang: "en", draft: false }, "invalidlangneedle");
    try { await build("reject-directory-language-conflict", /invalid-language\.md[^\n]*(?:lang|语言)[^\n]*(?:match|冲突|不一致)/i); }
    finally { fs.rmSync(invalidLang, { force: true }); }
    const duplicate = writePost("zh", "duplicate-translation-key.md", { title: "Duplicate translation key", published: "2024-01-01", translationKey: "different-slug-pair", draft: false }, "duplicatekeyneedle");
    try { await build("reject-duplicate-translation-key", /duplicate-translation-key\.md[^\n]*(?:translationKey|translation key|翻译)/i); }
    finally { fs.rmSync(duplicate, { force: true }); }
  }
  // The final build is valid so --keep-temp can be used for browser checks.
  await build("published-bilingual-fixtures");
  verifyFixtures();
  console.log(`PASS: ${assertions} assertions; empty pages, authoring, validation, localized routes, feeds, pagination, translations, assets, and search indexes.`);
} catch (error) {
  console.error(error.stack ?? error);
  process.exitCode = 1;
} finally {
  process.removeListener("SIGINT", stopChild);
  process.removeListener("SIGTERM", stopChild);
  if (options.keepTemp) console.log(`Kept temporary project and logs: ${tempRoot}\nPreview: cd ${JSON.stringify(tempRoot)} && pnpm preview --host 127.0.0.1`);
  else fs.rmSync(tempRoot, { recursive: true, force: true });
}
