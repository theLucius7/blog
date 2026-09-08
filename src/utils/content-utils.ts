import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { type Locale, locales } from "@i18n/locales";
import { i18n } from "@i18n/translation";
import { getCategoryUrl, getPostUrlBySlug } from "@utils/url-utils.ts";

type Post = CollectionEntry<"posts">;

export type PostAlternate = {
	locale: Locale;
	url: string;
};

export function getPostLocale(entry: Post): Locale {
	const directory = entry.id.replace(/\\/g, "/").split("/")[0];
	if (!locales.includes(directory as Locale)) {
		throw new Error(
			`[content] Post "${entry.id}" must be inside src/content/posts/zh/ or src/content/posts/en/.`,
		);
	}
	return directory as Locale;
}

function relativeSlug(entry: Post): string {
	const locale = getPostLocale(entry);
	const prefix = `${locale}/`;
	if (!entry.slug.startsWith(prefix) || entry.slug.length === prefix.length) {
		throw new Error(
			`[content] Post "${entry.id}" has slug "${entry.slug}". Its slug must start with "${prefix}" and include a post name.`,
		);
	}
	const slug = entry.slug.slice(prefix.length);
	const validSegments = slug.split("/").every((segment) => {
		try {
			const decoded = decodeURIComponent(segment);
			return (
				decoded.length > 0 &&
				decoded !== "." &&
				decoded !== ".." &&
				!/[\\/?#]/.test(decoded)
			);
		} catch {
			return false;
		}
	});
	if (!validSegments) {
		throw new Error(
			`[content] Post "${entry.id}" has invalid slug "${entry.slug}". Use non-empty path segments without dot segments, backslashes, query strings, or fragments.`,
		);
	}
	return slug;
}

function translationKey(entry: Post): string {
	return entry.data.translationKey ?? relativeSlug(entry);
}

async function getValidatedPosts(): Promise<Post[]> {
	const posts = await getCollection("posts");
	const translations = new Map<string, string>();
	const slugs = new Map<string, string>();

	for (const entry of posts) {
		const locale = getPostLocale(entry);
		relativeSlug(entry);
		const language = entry.data.lang.trim().toLowerCase().replace("_", "-");
		const expectedLanguages = locale === "zh" ? ["zh", "zh-cn"] : ["en"];
		if (language && !expectedLanguages.includes(language)) {
			throw new Error(
				`[content] Post "${entry.id}" has lang "${entry.data.lang}", which does not match its "${locale}" directory. Use ${locale === "zh" ? '"zh-CN" (or "zh_CN")' : '"en"'}, or omit lang.`,
			);
		}

		const duplicateSlug = slugs.get(entry.slug);
		if (duplicateSlug) {
			throw new Error(
				`[content] Posts "${duplicateSlug}" and "${entry.id}" share slug "${entry.slug}". Use unique post paths.`,
			);
		}
		slugs.set(entry.slug, entry.id);

		const key = `${locale}:${translationKey(entry)}`;
		const duplicateTranslation = translations.get(key);
		if (duplicateTranslation) {
			throw new Error(
				`[content] Posts "${duplicateTranslation}" and "${entry.id}" share translation key "${translationKey(entry)}" in "${locale}". Each language can have only one post per translation key.`,
			);
		}
		translations.set(key, entry.id);
	}

	return posts;
}

function isVisible(entry: Post): boolean {
	return import.meta.env.DEV || !entry.data.draft;
}

async function getRawSortedPosts(locale: Locale): Promise<Post[]> {
	const posts = await getValidatedPosts();
	return posts
		.filter((entry) => getPostLocale(entry) === locale && isVisible(entry))
		.sort(
			(a, b) =>
				b.data.published.valueOf() - a.data.published.valueOf() ||
				a.slug.localeCompare(b.slug),
		);
}

export async function getSortedPosts(locale: Locale): Promise<Post[]> {
	const sorted = await getRawSortedPosts(locale);
	return sorted.map((entry, index) => ({
		...entry,
		data: {
			...entry.data,
			nextSlug: sorted[index - 1]?.slug ?? "",
			nextTitle: sorted[index - 1]?.data.title ?? "",
			prevSlug: sorted[index + 1]?.slug ?? "",
			prevTitle: sorted[index + 1]?.data.title ?? "",
		},
	}));
}

export async function getPostAlternates(entry: Post): Promise<PostAlternate[]> {
	const posts = await getValidatedPosts();
	const key = translationKey(entry);
	return locales.flatMap((locale) => {
		const translated = posts.find(
			(post) =>
				getPostLocale(post) === locale &&
				translationKey(post) === key &&
				isVisible(post),
		);
		return translated
			? [{ locale, url: getPostUrlBySlug(translated.slug, locale) }]
			: [];
	});
}

export type PostForList = {
	slug: string;
	data: Post["data"];
};

export async function getSortedPostsList(
	locale: Locale,
): Promise<PostForList[]> {
	const posts = await getRawSortedPosts(locale);
	return posts.map(({ slug, data }) => ({ slug, data }));
}

export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(locale: Locale): Promise<Tag[]> {
	const posts = await getRawSortedPosts(locale);
	const counts = new Map<string, number>();
	for (const post of posts) {
		for (const tag of post.data.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return [...counts.keys()]
		.sort((a, b) => a.localeCompare(b, locale))
		.map((name) => ({ name, count: counts.get(name) ?? 0 }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(locale: Locale): Promise<Category[]> {
	const posts = await getRawSortedPosts(locale);
	const counts = new Map<string, number>();
	for (const post of posts) {
		const category =
			post.data.category?.trim() || i18n(I18nKey.uncategorized, locale);
		counts.set(category, (counts.get(category) ?? 0) + 1);
	}
	return [...counts.keys()]
		.sort((a, b) => a.localeCompare(b, locale))
		.map((name) => ({
			name,
			count: counts.get(name) ?? 0,
			url: getCategoryUrl(name, locale),
		}));
}
