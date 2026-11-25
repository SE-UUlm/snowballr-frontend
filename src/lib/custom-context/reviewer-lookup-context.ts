import { getContext, setContext } from "svelte";
import { createReviewerLookup, type ReviewerLookup } from "#lib/model/reviewer-lookup.js";

/**
 * Key for the context storing the {@link ReviewerLookup} that the paper list entries of a page share,
 * so that each reviewer is requested at most once per page.
 */
export const REVIEWER_LOOKUP_KEY = Symbol("reviewerLookup");

/**
 * Shares a new {@link ReviewerLookup} with all components below the calling one.
 * Call it in the page that renders the paper lists.
 */
export function setReviewerLookupContext(): void {
    setContext(REVIEWER_LOOKUP_KEY, createReviewerLookup());
}

/**
 * Returns the {@link ReviewerLookup} shared by the page, or a new one for the calling component, if
 * the page shares none.
 */
export function getReviewerLookupContext(): ReviewerLookup {
    return getContext<ReviewerLookup | undefined>(REVIEWER_LOOKUP_KEY) ?? createReviewerLookup();
}
