import I18nKey from "@i18n/i18nKey";
import { defaultLocale, isLocale, type Locale } from "@i18n/locales";
import { i18n } from "@i18n/translation";

export function pathsEqual(path1: string, path2: string) {
	const normalizedPath1 = path1.replace(/^\/|\/$/g, "").toLowerCase();
	const normalizedPath2 = path2.replace(/^\/|\/$/g, "").toLowerCase();
	return normalizedPath1 === normalizedPath2;
}

function joinUrl(...parts: string[]): string {
	const joined = parts.join("/");
	return joined.replace(/\/+/g, "/");
}

export function localeUrl(locale: Locale, path = "/"): string {
	const relative = path.replace(/^\//, "");
	const first = relative.split("/")[0];
	const localizedPath = isLocale(first)
		? relative.slice(first.length).replace(/^\//, "")
		: relative;
	return url(`/${locale}/${localizedPath}`);
}

export function getPostUrlBySlug(slug: string, locale?: Locale): string {
	const parts = slug.replace(/^\//, "").split("/");
	const first = parts[0];
	const slugLocale = isLocale(first) ? first : defaultLocale;
	if (isLocale(first)) parts.shift();
	return localeUrl(locale || slugLocale, `/posts/${parts.join("/")}/`);
}

export function getTagUrl(tag: string, locale: Locale = defaultLocale): string {
	if (!tag) return localeUrl(locale, "/archive/");
	return localeUrl(locale, `/archive/?tag=${encodeURIComponent(tag.trim())}`);
}

export function getCategoryUrl(
	category: string | null,
	locale: Locale = defaultLocale,
): string {
	if (
		!category ||
		category.trim() === "" ||
		category.trim().toLowerCase() ===
			i18n(I18nKey.uncategorized, locale).toLowerCase()
	)
		return localeUrl(locale, "/archive/?uncategorized=true");
	return localeUrl(
		locale,
		`/archive/?category=${encodeURIComponent(category.trim())}`,
	);
}

export function getDir(path: string): string {
	const lastSlashIndex = path.lastIndexOf("/");
	if (lastSlashIndex < 0) {
		return "/";
	}
	return path.substring(0, lastSlashIndex + 1);
}

export function url(path: string) {
	return joinUrl("", import.meta.env.BASE_URL, path);
}
