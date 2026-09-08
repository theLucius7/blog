import { type Locale, locales } from "@i18n/locales";
import type { APIContext, GetStaticPaths } from "astro";
import { createFeed } from "../rss.xml";

export const getStaticPaths = (() =>
	locales.map((locale) => ({ params: { locale } }))) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
	const locale = context.params.locale as Locale;
	return createFeed(locale, context);
}
