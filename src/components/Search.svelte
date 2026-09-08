<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import type { Locale } from "@i18n/locales";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import type { SearchResult } from "@/global";

export let locale: Locale = "zh";

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let searchFailed = false;
let pagefindLoaded = false;
let initialized = false;
let activeKeyword = "";
let activeIsDesktop = true;
let searchVersion = 0;

const isDevelopment = import.meta.env.DEV;

$: messages =
	locale === "en"
		? {
				loading: "Searching…",
				empty: "No results found.",
				error: "Search is unavailable. Please refresh and try again.",
				development:
					"Search is available after building and previewing the site.",
			}
		: {
				loading: "正在搜索…",
				empty: "没有找到相关内容。",
				error: "搜索暂时不可用，请刷新后重试。",
				development: "开发预览不提供搜索，请构建后预览。",
			};

const togglePanel = () => {
	const panel = document.getElementById("search-panel");
	panel?.classList.toggle("float-panel-closed");
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	const panel = document.getElementById("search-panel");
	if (!panel || !isDesktop) return;

	if (show) {
		panel.classList.remove("float-panel-closed");
	} else {
		panel.classList.add("float-panel-closed");
	}
};

const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
	const version = ++searchVersion;
	const query = keyword.trim();
	activeKeyword = query;
	activeIsDesktop = isDesktop;
	result = [];
	searchFailed = false;
	if (!query) {
		isSearching = false;
		setPanelVisibility(false, isDesktop);
		return;
	}

	isSearching = !isDevelopment;
	setPanelVisibility(true, isDesktop);
	if (!initialized) {
		return;
	}

	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
			// Pagefind selects its language index from <html lang> on initialization.
			const response = await window.pagefind.search(query);
			searchResults = await Promise.all(
				response.results.map((item) => item.data()),
			);
		} else if (!isDevelopment) {
			throw new Error("Pagefind is not available.");
		}

		if (version !== searchVersion) return;
		// A missing language index makes Pagefind fall back to another language.
		// Keep results in the current /zh/ or /en/ route even in that case.
		result = searchResults.filter((item) => {
			const target = new URL(item.url, window.location.origin);
			return (
				target.origin === window.location.origin &&
				target.pathname.split("/").filter(Boolean)[0] === locale
			);
		});
	} catch (error) {
		if (version !== searchVersion) return;
		console.error("Search error:", error);
		result = [];
		searchFailed = true;
	} finally {
		if (version === searchVersion) isSearching = false;
	}
};

onMount(() => {
	const initializeSearch = () => {
		initialized = true;
		pagefindLoaded =
			typeof window !== "undefined" &&
			!!window.pagefind &&
			typeof window.pagefind.search === "function";
		if (activeKeyword) search(activeKeyword, activeIsDesktop);
	};

	if (import.meta.env.DEV) {
		initializeSearch();
	} else {
		document.addEventListener("pagefindready", initializeSearch);
		document.addEventListener("pagefindloaderror", initializeSearch);

		// Fallback in case events are not caught or pagefind is already loaded by the time this script runs
		const timeout = setTimeout(() => {
			if (!initialized) initializeSearch();
		}, 2000);
		return () => {
			clearTimeout(timeout);
			document.removeEventListener("pagefindready", initializeSearch);
			document.removeEventListener("pagefindloaderror", initializeSearch);
			searchVersion++;
		};
	}
});
</script>

<!-- search bar for desktop view -->
<div id="search-bar" class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
">
    <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
    <input type="search" placeholder={i18n(I18nKey.search, locale)} aria-label={i18n(I18nKey.search, locale)} aria-controls="search-results"
           bind:value={keywordDesktop} on:input={(event) => search(event.currentTarget.value, true)} on:focus={() => search(keywordDesktop, true)}
           class="transition-all pl-10 text-sm bg-transparent outline-0
         h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
    >
</div>

<!-- toggle btn for phone/tablet view -->
<button on:click={togglePanel} aria-label={i18n(I18nKey.search, locale)} aria-controls="search-panel" id="search-switch"
        class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90">
    <Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

<!-- search panel -->
<div id="search-panel" class="float-panel float-panel-closed search-panel absolute md:w-[30rem]
top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2">

    <!-- search bar inside panel for phone/tablet -->
    <div id="search-bar-inside" class="flex relative lg:hidden transition-all items-center h-11 rounded-xl
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
  ">
        <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
        <input type="search" placeholder={i18n(I18nKey.search, locale)} aria-label={i18n(I18nKey.search, locale)} aria-controls="search-results"
               bind:value={keywordMobile} on:input={(event) => search(event.currentTarget.value, false)} on:focus={() => search(keywordMobile, false)}
               class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/50 dark:text-white/50"
        >
    </div>

    <div id="search-results" aria-live="polite" aria-busy={isSearching}>
        {#if isDevelopment}
            <p class="px-3 py-3 text-sm text-50" role="status">{messages.development}</p>
        {:else if isSearching}
            <p class="px-3 py-3 text-sm text-50" role="status">{messages.loading}</p>
        {:else if searchFailed}
            <p class="px-3 py-3 text-sm text-50" role="status">{messages.error}</p>
        {:else if activeKeyword && result.length === 0}
            <p class="px-3 py-3 text-sm text-50" role="status">{messages.empty}</p>
        {/if}

        <!-- search results -->
        {#each result as item}
        <a href={item.url}
           class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
       rounded-xl text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]">
            <div class="transition text-90 inline-flex font-bold group-hover:text-[var(--primary)]">
                {item.meta.title}<Icon icon="fa6-solid:chevron-right" class="transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]"></Icon>
            </div>
            <div class="transition text-sm text-50">
                {@html item.excerpt}
            </div>
        </a>
        {/each}
    </div>
</div>

<style>
  input:focus {
    outline: 0;
  }
  .search-panel {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
</style>
