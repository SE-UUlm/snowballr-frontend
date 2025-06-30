import { describe, expect, test } from "vitest";
import {
    getFilterFromURL,
    getSearchTextFromURL,
    getSortOptionFromURL,
    updateFiltersParam,
    updateSearchTextParam,
    updateSortParams,
} from "$lib/utils/search-parameters";
import { page } from "$app/state";
import { SvelteURLSearchParams } from "svelte/reactivity";
import { SortCriteria, SortDirection } from "$lib/model/sort-criteria";

describe("Helper search text URL query parameter", () => {
    test("When the query parameter for the search text is present, then it will be successfully read and returned.", async () => {
        page.url = new URL("http://localhost/test?searchText=hello+world");

        expect(getSearchTextFromURL()).toBe("hello world");
    });

    test("When the query parameter for the search text is not present, then an empty string will be returned.", async () => {
        page.url = new URL("http://localhost/test");

        expect(getSearchTextFromURL()).toBe("");
        expect(getSearchTextFromURL()).not.toBe("hello world");
    });

    test(
        "When the query parameter for the search text should be updated, but the search text is empty, " +
            "then the query parameter will be deleted.",
        async () => {
            const searchParameters = new SvelteURLSearchParams("searchText=hello+world");
            expect(updateSearchTextParam("", searchParameters)).toStrictEqual(
                new SvelteURLSearchParams(""),
            );
        },
    );

    test(
        "When the query parameter for the search text should be updated and is not empty, " +
            "then the query parameter will be updated.",
        async () => {
            const searchParameters = new SvelteURLSearchParams("searchText=hello+world");
            expect(updateSearchTextParam("hello hello", searchParameters)).toStrictEqual(
                new SvelteURLSearchParams("searchText=hello+hello"),
            );
        },
    );
});

describe("Helper filters URL query parameters", () => {
    test("When the query parameters for the filters are present, then they will be successfully read and returned.", async () => {
        page.url = new URL(
            "http://localhost/test?decisions=1&stages=0&reviewers=paula.thompson%40example.com&publishers=IEEE%2CCRC+Press&years=2019%2C2020&criteria=15",
        );

        expect(getFilterFromURL()).toStrictEqual({
            stages: ["0"],
            reviewers: ["paula.thompson@example.com"],
            publishers: ["IEEE", "CRC Press"],
            years: ["2019", "2020"],
            decisions: ["1"],
            criteria: ["15"],
        });
    });

    test("When a query parameters for a filter is not present, then an empty array will be returned for this filter.", async () => {
        page.url = new URL("http://localhost/test?decisions=");

        expect(getFilterFromURL()).toStrictEqual({
            stages: [],
            reviewers: [],
            publishers: [],
            years: [],
            decisions: [],
            criteria: [],
        });
    });

    test(
        "When the query parameter for a filter should be updated, but the values array is empty, " +
            "then the query parameter will be deleted.",
        async () => {
            const searchParameters = new SvelteURLSearchParams("decisions=1");
            const filters = {
                stages: [],
                reviewers: [],
                publishers: [],
                years: [],
                decisions: [],
                criteria: [],
            };
            expect(updateFiltersParam(filters, searchParameters)).toStrictEqual(
                new SvelteURLSearchParams(""),
            );
        },
    );

    test(
        "When the query parameter for a filter should be updated and the values array is " +
            "not empty, then the query parameter will be updated for this filter will be updated.",
        async () => {
            const searchParameters = new SvelteURLSearchParams("decisions=1");
            const filters = {
                stages: [],
                reviewers: [],
                publishers: [],
                years: [],
                decisions: ["1", "2"],
                criteria: [],
            };
            expect(updateFiltersParam(filters, searchParameters)).toStrictEqual(
                new SvelteURLSearchParams("decisions=1,2"),
            );
        },
    );
});

describe("Helper sort URL query parameter", () => {
    test("When the query parameter for the sort option is present, then it will be successfully read and returned.", async () => {
        page.url = new URL("http://localhost/test?sort=Title&order=desc");

        expect(getSortOptionFromURL()).toBe("Title: Z to A");
    });

    test("When the query parameter for the sort option is not present, then the default sort option 'Id: Low to High' is returned.", async () => {
        page.url = new URL("http://localhost/test");

        expect(getSortOptionFromURL()).toBe("Id: Low to High");
    });

    test(
        "When the query parameter for the sort option should be updated, but the sort option object is not " +
            "defined, then the query parameter will be deleted.",
        async () => {
            const searchParameters = new SvelteURLSearchParams("sort=Title&order=desc");
            expect(updateSortParams(searchParameters)).toStrictEqual(new SvelteURLSearchParams(""));
        },
    );

    test(
        "When the query parameter for the sort option should be updated and the sort option object is " +
            "defined, then the query parameter will be updated accordingly.",
        async () => {
            const searchParameters = new SvelteURLSearchParams("sort=Title&order=desc");
            expect(
                updateSortParams(searchParameters, {
                    criterion: SortCriteria.YEAR,
                    direction: SortDirection.ASC,
                }),
            ).toStrictEqual(new SvelteURLSearchParams("sort=Year&order=asc"));
        },
    );
});
