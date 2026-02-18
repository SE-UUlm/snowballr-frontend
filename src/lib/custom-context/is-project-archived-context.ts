import { getContext, setContext } from "svelte";

type IsProjectArchivedState = { isProjectArchived: boolean };
/**
 * Key for context storing whether the currently opened project is archived or not.
 */
export const IS_PROJECT_ARCHIVED_KEY = Symbol("isProjectArchived");
export function setIsProjectArchivedContext(isProjectArchived: IsProjectArchivedState) {
    setContext(IS_PROJECT_ARCHIVED_KEY, isProjectArchived);
}
export function getIsProjectArchivedContext(): IsProjectArchivedState {
    return getContext(IS_PROJECT_ARCHIVED_KEY);
}
