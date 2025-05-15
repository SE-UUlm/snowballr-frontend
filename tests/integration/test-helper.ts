import { waitFor, screen } from "@testing-library/svelte";
import { expect } from "vitest";
import {
    SELECTED_REVIEW_CRITERIA_KEY,
    WAS_PROJECT_PAPER_ALREADY_REVIEWED_KEY,
} from "$lib/utils/custom-context";

/**
 * Awaits until all skeletons are removed from the screen.
 *
 * To wait for a skeleton to load, the skeleton must have a data-testid attribute with the value 'skeleton'.
 */
export function waitForComponentLoading(): Promise<void> {
    return waitFor(() => {
        // The data-testid may be overwritten, so we don't match exactly 'skeleton'.
        const skeletons = screen.queryAllByTestId("skeleton", { exact: false });
        expect(skeletons).toHaveLength(0);
    });
}

export const mockSelectedCriteriaContext = new Map([
    [SELECTED_REVIEW_CRITERIA_KEY, { criteria: [] }],
    [WAS_PROJECT_PAPER_ALREADY_REVIEWED_KEY, { wasReviewed: false }],
]);
export const mockSelectedCriteriaContextWithInitialData = (
    selectedCriteria?: string[],
    wasAlreadyReviewed?: boolean,
) =>
    new Map([
        [SELECTED_REVIEW_CRITERIA_KEY, { criteria: selectedCriteria ?? [] }],
        [WAS_PROJECT_PAPER_ALREADY_REVIEWED_KEY, { wasReviewed: wasAlreadyReviewed ?? false }],
    ]);
