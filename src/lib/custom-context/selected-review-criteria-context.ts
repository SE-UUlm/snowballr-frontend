import type { CriteriaList } from "$lib/model/general";
import { getContext, setContext } from "svelte";

/**
 * Key for context storing a list of selected criteria ids for a
 * specific project paper.
 */
export const SELECTED_REVIEW_CRITERIA_KEY = Symbol("selectedReviewCriteria");
export function setSelectedReviewCriteriaContext(selectedCriteria: CriteriaList) {
    setContext(SELECTED_REVIEW_CRITERIA_KEY, selectedCriteria);
}
export function getSelectedReviewCriteriaContext() {
    return getContext(SELECTED_REVIEW_CRITERIA_KEY) as CriteriaList;
}
