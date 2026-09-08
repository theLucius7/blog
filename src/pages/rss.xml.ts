import rss from "@astrojs/rss";
import { defaultLocale, getHtmlLang, type Locale } from "@i18n/locales";
import { getSortedPosts } from "@utils/content-utils";
import { getPostUrlBySlug, localeUrl } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

export async function createFeed(locale: Locale, context: APIContext) {
	const blog = await getSortedPosts(locale);

	return rss({
		title: `${siteConfig.title} · ${locale === "zh" ? "中文" : "English"}`,
		description: siteConfig.subtitle || siteConfig.title,
		site: new URL(localeUrl(locale), context.site),
		items: blog.map((post) => {
			const content =
				typeof post.body === "string" ? post.body : String(post.body || "");
			const cleanedContent = stripInvalidXmlChars(content);
			return {
				title: post.data.title,
				pubDate: post.data.published,
				description: post.data.description || "",
				link: getPostUrlBySlug(post.slug, locale),
				content: sanitizeHtml(parser.render(cleanedContent), {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				}),
			};
		}),
		customData: `<language>${getHtmlLang(locale)}</language>`,
	});
}

// Keep existing subscriptions working while the locale feeds have separate URLs.
export async function GET(context: APIContext) {
	return createFeed(defaultLocale, context);
}
