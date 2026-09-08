export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh";

export function isLocale(value: string): value is Locale {
	return locales.some((locale) => locale === value);
}

export function getLocaleFromPath(pathname: string): Locale {
	const base = import.meta.env.BASE_URL.replace(/^\/|\/$/g, "");
	const path = pathname.replace(/^\//, "");
	const relative =
		base && path.startsWith(`${base}/`) ? path.slice(base.length + 1) : path;
	const segment = relative.split("/")[0];
	return isLocale(segment) ? segment : defaultLocale;
}

export function getHtmlLang(locale: Locale): string {
	return locale === "zh" ? "zh-CN" : "en";
}
