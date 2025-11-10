import { getContext, setContext } from "svelte";

type WasReviewedState = { wasReviewed: boolean };
/**
 * Key for context storing whether the project paper, the context is attached to was already
 * reviewed by the user currently logged in or not.
 */
export const WAS_PROJECT_PAPER_ALREADY_REVIEWED_KEY = Symbol("wasProjectPaperAlreadyReviewed");
export function setAlreadyReviewedContext(alreadyReviewed: WasReviewedState) {
    setContext(WAS_PROJECT_PAPER_ALREADY_REVIEWED_KEY, alreadyReviewed);
}
export function getAlreadyReviewedContext() {
    return getContext(WAS_PROJECT_PAPER_ALREADY_REVIEWED_KEY) as WasReviewedState;
}
