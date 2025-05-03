import type { CriteriaList } from "$lib/model/general";
import { getContext, setContext } from "svelte";

export const SELECTED_REVIEW_CRITERIA_KEY = "selectedReviewCriteria";
export function setSelectedReviewCriteriaContext(selectedCriteria: CriteriaList) {
    setContext(SELECTED_REVIEW_CRITERIA_KEY, selectedCriteria);
}
export function getSelectedReviewCriteriaContext() {
    return getContext(SELECTED_REVIEW_CRITERIA_KEY) as CriteriaList;
}
