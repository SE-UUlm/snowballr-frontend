import { page } from "$app/state";
import type { ProjectPaperFilter } from "$lib/model/general";
import type { SvelteURLSearchParams } from "svelte/reactivity";
import {
    ALLOWED_SORT_OPTIONS,
    SortCriteria,
    SortDirection,
    type SortOption,
    type SortOptionLabel,
} from "$lib/model/sort-criteria";
import { callDebounced, stringToEnumValue } from "$lib/utils/common-helper";
import { goto } from "$app/navigation";
import type { ResolvedPathname } from "$app/types";

function getUrlSearchParam(key: string): string | null {
    return page.url.searchParams.get(key);
}

/**
 * Returns the 'searchText' query parameter from the current URL.
 * If this query parameter is not set, an empty string is returned as default.
 */
export function getSearchTextFromURL() {
    return getUrlSearchParam("searchText") ?? "";
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
export function updateSearchTextParam(
    searchText: string,
    searchParams: SvelteURLSearchParams,
): SvelteURLSearchParams {
    if (searchText === "") {
        searchParams.delete("searchText");
    } else {
        searchParams.set("searchText", searchText);
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
    const getArray = (key: string) => getUrlSearchParam(key)?.split(",").filter(Boolean) ?? [];

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
export function updateFiltersParam(
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

/**
 * Returns the label of the sort option corresponding to the 'sort' and 'order'
 * query parameter from the current URL.
 * If this query parameter is not set, 'Id: Low to High' is returned as default.
 */
export function getSortOptionFromURL(): SortOptionLabel {
    const sortCriterion = getUrlSearchParam("sort");
    const sortDirection = getUrlSearchParam("order");

    if (!sortCriterion || !sortDirection) {
        return "Id: Low to High";
    }

    const label = (Object.keys(ALLOWED_SORT_OPTIONS) as Array<SortOptionLabel>).find(
        (key) =>
            ALLOWED_SORT_OPTIONS[key].criterion ===
                stringToEnumValue(SortCriteria, sortCriterion) &&
            ALLOWED_SORT_OPTIONS[key].direction === stringToEnumValue(SortDirection, sortDirection),
    );

    return label ?? "Id: Low to High";
}

/**
 * Updates the 'sort' and 'order' query parameter in the given URL search parameters.
 * If either the sort criterion or the sort direction is undefined, the query parameter is deleted.
 *
 * @remarks
 * This function does not modify the browser's URL directly.
 * @param searchParams - The current URL search parameters
 * @param sortOption - The sort option, e.g. 'Title' and 'asc', to set in the URL
 * @returns The updated search parameters with the added, deleted or updated 'sort' and 'order' values.
 */
export function updateSortParams(
    searchParams: SvelteURLSearchParams,
    sortOption?: SortOption,
): SvelteURLSearchParams {
    if (sortOption) {
        searchParams.set("sort", sortOption.criterion);
        searchParams.set("order", sortOption.direction);
    } else {
        searchParams.delete("sort");
        searchParams.delete("order");
    }
    return searchParams;
}

/**
 * Updates the URl params and executes a debounced navigation to the new URL if the given search
 * parameters differ from the current search parameters.
 *
 * @param searchParameters - The search parameters to compare and potentially navigate to.
 */
export function updateUrlParams(searchParameters: SvelteURLSearchParams): void {
    if (searchParameters.toString() !== globalThis.location.search.slice(1)) {
        callDebounced(
            () =>
                goto(`?${searchParameters.toString()}`, {
                    replaceState: true,
                    keepFocus: true,
                }),
            250,
        );
    }
}

/**
 * Returns the 'redirect' query parameter from the current URL.
 */
function getRedirectParam(): string | null {
    return getUrlSearchParam("redirect");
}

/**
 * Returns the 'redirect' query parameter from the current URL if it exists,
 * otherwise returns the provided value.
 *
 * @param value - The value to return if the 'redirect' parameter does not exist.
 * @returns The redirect URL from the query parameter or the provided value.
 */
export function getRedirectUrlOrValue(value: ResolvedPathname) {
    return getRedirectParam() ?? value;
}

/**
 * Adds the 'redirect' query parameter to the given URL if it exists in the current URL.
 * I.e., it passes the redirect parameter along to another URL.
 *
 * @param url - The URL to which the redirect parameter should be added.
 * @returns The URL with the added redirect parameter if it exists.
 */
export function addRedirectUrlIfExists(url: string) {
    const redirectUrl = getRedirectParam();
    return url + (redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : "");
}
