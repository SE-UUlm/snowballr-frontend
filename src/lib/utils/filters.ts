import { Fzf, type Selector } from "fzf";
import type { Paper } from "../model/api/paper";
import { getName, getNames } from "./common-helper";
import type { User } from "../model/api/user";
import type { ReadingListEntryInterface } from "$lib/model/component-interfaces";

/**
 * Generic filter function using Fzf.
 *
 * @param items - List of items to filter
 * @param selector - Function to extract the string to match against
 * @param searchText - Search text
 * @returns List of items that match the search text
 */
function filter<T>(items: T[], selector: (item: T) => string, searchText: string) {
    // Here we cast the items to string[] and selector to Selector<string> because we can't just use a selector
    // with a generic type. This is weird, but it's the only way to make it work.
    const fzf = new Fzf(items as string[], {
        selector: selector as Selector<string>,
        casing: "case-insensitive",
    });
    return fzf.find(searchText).map((result) => result.item) as T[];
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
 * Filter users based on search text and sorts them by best match.
 *
 * The search text is matched against the following fields:
 * - User Name
 * - User Email
 *
 * @param allUsers - List of all users
 * @param searchText - Search text
 * @returns List of users that match the search text
 */
function filterUsers(allUsers: User[], searchText: string) {
    return filter(allUsers, (user) => `${getName(user)} ${user.email}`, searchText);
}

/**
 * Filters reading list entries (wrapper around a paper) based on search text and sorts them by best match.
 *
 * The search text is matched against the following fields:
 * - paper title
 * - paper authors
 *
 * @param allEntries - List of all reading list entries
 * @param searchText - Search text
 * @returns List of all reading list entries that match the search text
 */
function filterReadingListEntries(
    allEntries: ReadingListEntryInterface[],
    searchText: string,
): ReadingListEntryInterface[] {
    return filter(
        allEntries.map((entry) => entry.paper),
        (paper) => `${paper.title} ${getNames(paper.authors)}`,
        searchText,
    ).map((paper) => ({
        paper: paper,
    }));
}

export { filterPapers, filterUsers, filterReadingListEntries };
