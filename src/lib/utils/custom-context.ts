import type { CriteriaList } from "$lib/model/general";
import { getContext, setContext } from "svelte";

/**
 * Key for context storing a reactive state containing a list of selected criteria ids for a
 * specific project paper.
 */
export const SELECTED_REVIEW_CRITERIA_KEY = Symbol("selectedReviewCriteria");
export function setSelectedReviewCriteriaContext(selectedCriteria: CriteriaList) {
    setContext(SELECTED_REVIEW_CRITERIA_KEY, selectedCriteria);
}
export function getSelectedReviewCriteriaContext() {
    return getContext(SELECTED_REVIEW_CRITERIA_KEY) as CriteriaList;
}

type WasReviewedState = { wasReviewed: boolean };
/**
 * Key for context storing a reactive state whether the project paper, the context is attached to, was already
 * reviewed by the user currently logged in or not.
 */
export const WAS_PROJECT_PAPER_ALREADY_REVIEWED_KEY = Symbol("wasProjectPaperAlreadyReviewed");
export function setAlreadyReviewedContext(alreadyReviewed: WasReviewedState) {
    setContext(WAS_PROJECT_PAPER_ALREADY_REVIEWED_KEY, alreadyReviewed);
}
export function getAlreadyReviewedContext() {
    return getContext(WAS_PROJECT_PAPER_ALREADY_REVIEWED_KEY) as WasReviewedState;
}
