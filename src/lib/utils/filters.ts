import { basicMatch, extendedMatch, Fzf, type Selector } from "fzf";
import type { Paper } from "$api/paper";
import { getNames } from "./common-helper";
import type { Project_Paper } from "$api/project";
import type { ProjectPaperFilter } from "$lib/model/general";

/**
 * Generic filter function using Fzf.
 *
 * @param items - List of items to filter
 * @param selector - Function to extract the string to match against
 * @param searchText - Search text
 * @param extended - Whether to use extended matching
 * @returns List of items that match the search text
 */
function filter<T>(
    items: T[],
    selector: (item: T) => string,
    searchText: string,
    extended: boolean = false,
) {
    // Here we cast the items to string[] and selector to Selector<string> because we can't just use a selector
    // with a generic type. This is weird, but it's the only way to make it work.
    const fzf = new Fzf(items as string[], {
        selector: selector as Selector<string>,
        match: extended ? extendedMatch : basicMatch,
        casing: "case-insensitive",
    });
    return fzf.find(searchText).map((result) => result.item) as T[];
}

/**
 * Checks if a given project paper matches all active project paper filters.
 *
 * @remarks
 * Only filters that have one or more selected values are applied (called *active*), the remaining filters are ignored.
 * A project paper must match all *active* filters.
 * This means for the stage, publisher, year or decision of the project paper
 * that the paper's stage, etc. must be in the list of the filters.
 * Regarding the reviewers or selected criteria, at least one review or selected criterion of the project paper
 * must be in the list of the filters.
 *
 * @param paper - The paper to evaluate against the filters.
 * @param filters - The filters to check against.
 * @returns True if the paper matches all filters, false otherwise.
 */
function matchesPaperFilters(paper: Project_Paper, filters: ProjectPaperFilter) {
    const { stages, reviewers, publishers, years, decisions, criteria } = filters;

    const matchesFilter = (filter: string[], value: string | bigint | number | undefined) =>
        filter.length === 0 || (value !== undefined && filter.includes(String(value)));

    if (!matchesFilter(stages, paper.stage)) {
        return false;
    }

    if (
        reviewers.length > 0 &&
        !paper.reviews.some((review) => reviewers.includes(review.userId))
    ) {
        return false;
    }

    if (!matchesFilter(publishers, paper.paper?.publisher)) {
        return false;
    }

    if (!matchesFilter(years, paper.paper?.year)) {
        return false;
    }

    if (!matchesFilter(decisions, paper.decision)) {
        return false;
    }

    if (
        criteria.length > 0 &&
        !paper.reviews.some((review) =>
            review.selectedCriteriaIds.some((criterionId) => criteria.includes(criterionId)),
        )
    ) {
        return false;
    }

    return true;
}

/**
 * Filters papers based on search text and sorts them by best match.
 *
 * The search text is matched against the following fields:
 * - Paper ID
 * - Paper Title
 * - Paper Authors
 *
 * @param allPapers - List of all papers
 * @param searchText - Search text
 * @returns List of papers that match the search text
 */
function filterPapers(allPapers: Paper[], searchText: string) {
    return filter(
        allPapers,
        (paper) => `#${paper.id} ${paper.title} ${getNames(paper.authors)}`,
        searchText,
    );
}

/**
 * Filters project papers based on filters and / or a search text and sorts them by best match.
 * If the search text starts with "#", it is treated as a paper ID.
 * Otherwise, it is treated as a search text for the paper title and authors and the local ID.
 *
 * The search text is matched against the following fields:
 * - Paper ID
 * - Paper Title
 * - Paper Authors
 *
 * In order to avoid being filtered out, a project paper must match at least one value in each
 * filter category.
 *
 * @param allProjectPapers - List of all project papers
 * @param filters - The set of filter for a project paper
 * @param searchText - Search text
 * @returns List of project papers that match the search text and filters
 */
function filterProjectPapers(
    allProjectPapers: Project_Paper[],
    filters?: ProjectPaperFilter,
    searchText?: string,
) {
    // filter by project paper filter
    if (filters) {
        allProjectPapers = allProjectPapers.filter((paper) => matchesPaperFilters(paper, filters));
    }

    // if no search text is given, only the filters are applied
    if (!searchText) {
        return allProjectPapers;
    }

    // filter by search text
    if (searchText.startsWith("#")) {
        const idToSearch = searchText.substring(1);
        return filter(
            allProjectPapers,
            (projectPaper) => projectPaper.localId ?? "",
            `^${idToSearch}`,
            true,
        );
    } else {
        return filter(
            allProjectPapers,
            (projectPaper) =>
                `${projectPaper.localId ?? ""} ${projectPaper.paper?.title ?? ""} ${getNames(projectPaper.paper?.authors ?? [])}`,
            searchText,
        );
    }
}

export { filterPapers, filterProjectPapers };
