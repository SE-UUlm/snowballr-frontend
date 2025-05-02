import { Fzf, type Selector } from "fzf";
import type { Paper } from "../model/api/paper";
import { getName, getNames } from "./common-helper";
import type { User } from "../model/api/user";
import type { Project_Paper } from "$lib/model/api/project";

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
 * Filters project papers based on search text and sorts them by best match.
 *
 * The search text is matched against the following fields:
 * - Paper ID
 * - Paper Title
 * - Paper Authors
 *
 * @param allProjectPapers - List of all project papers
 * @param searchText - Search text
 * @returns List of project papers that match the search text
 */
function filterProjectPapers(allProjectPapers: Project_Paper[], searchText: string) {
    return filter(
        allProjectPapers,
        (projectPaper) =>
            `#${projectPaper.paper?.title ?? ""} ${getNames(projectPaper.paper?.authors ?? [])} ${projectPaper.localId ?? ""}`,
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

export { filterPapers, filterProjectPapers, filterUsers };
