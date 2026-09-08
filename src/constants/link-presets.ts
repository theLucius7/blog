import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { defaultLocale, type Locale } from "@/i18n/locales";
import { LinkPreset, type NavBarLink } from "@/types/config";

export const getLinkPresets = (
	locale: Locale,
): { [key in LinkPreset]: NavBarLink } => ({
	[LinkPreset.Home]: {
		name: i18n(I18nKey.home, locale),
		url: "/",
	},
	[LinkPreset.About]: {
		name: i18n(I18nKey.about, locale),
		url: "/about/",
	},
	[LinkPreset.Archive]: {
		name: i18n(I18nKey.archive, locale),
		url: "/archive/",
	},
});

export const LinkPresets = getLinkPresets(defaultLocale);
