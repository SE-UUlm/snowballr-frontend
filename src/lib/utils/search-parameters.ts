import { page } from "$app/state";
import type { ProjectPaperFilter } from "$lib/model/general";
import type { SvelteURLSearchParams } from "svelte/reactivity";

/**
 * Returns the 'searchText' query parameter from the current URL.
 * If this query parameter is not set, an empty string is returned as default.
 */
export function getSearchTextFromURL() {
    return page.url.searchParams.get("searchText") ?? "";
}

/**
 * Updates the 'searchText' query parameter in the given URL search parameters.
 * If the search text is empty, the query parameter is deleted.
 *
 * @remarks
 * This function does not modify the browser's URL directly.
 *
 * @param searchText - The search text to set in the URL
 * @param searchParams - The current URL search parameters
 * @returns The updated search parameters with the added, deleted or updated 'searchText' value.
 */
export function updateSearchTextInURL(
    searchText: string,
    searchParams: SvelteURLSearchParams,
): SvelteURLSearchParams {
    if (searchText !== "") {
        searchParams.set("searchText", searchText);
    } else {
        searchParams.delete("searchText");
    }
    return searchParams;
}

/**
 * Extracts project paper filters from the query parameters from the current URL.
 * Returns an object of arrays, whereas each array represents the values of one filter.
 * If no query parameter for a filter is set, an empty array is used as default.
 *
 * @remarks
 * Each filter is expected to be a comma-separated list (e.g., ?stages=stage1,stage2).
 */
export function getFilterFromURL(): ProjectPaperFilter {
    const getArray = (key: string) =>
        page.url.searchParams.get(key)?.split(",").filter(Boolean) ?? [];

    return {
        stages: getArray("stages"),
        reviewers: getArray("reviewers"),
        publishers: getArray("publishers"),
        years: getArray("years"),
        decisions: getArray("decisions"),
        criteria: getArray("criteria"),
    };
}

/**
 * Updates the filter query parameters in the given URL search parameters.
 * If a filter array is empty, the corresponding query parameter is deleted.
 *
 * @remarks
 * This function does not modify the browser's URL directly.
 *
 * @param filters - The object containing currently applied filter values
 * @param searchParams - The current URL search parameters
 * @returns The updated search parameters with the added, deleted or updated filter values.
 */
export function updateFiltersInURL(
    filters: ProjectPaperFilter,
    searchParams: SvelteURLSearchParams,
): SvelteURLSearchParams {
    for (const key in filters) {
        const values = filters[key as keyof ProjectPaperFilter];
        if (values.length > 0) {
            searchParams.set(key, values.join(","));
        } else {
            searchParams.delete(key);
        }
    }
    return searchParams;
}
