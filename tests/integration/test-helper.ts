import { waitFor, screen } from "@testing-library/svelte";
import { expect } from "vitest";
import { WAS_PROJECT_PAPER_ALREADY_REVIEWED_KEY } from "$lib/custom-context/was-paper-reviewed-context";
import { SELECTED_REVIEW_CRITERIA_KEY } from "$lib/custom-context/selected-review-criteria-context";
import type { User } from "$lib/model/api/user";
import { USER_KEY, type UserContext } from "$lib/custom-context/user-context";
import { createUser } from "$tests/model-builder";
import { Users } from "$tests/example-data";

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

export interface SelectedCriteriaContextValue {
    criteria: string[];
}
export interface WasReviewedContextValue {
    wasReviewed: boolean;
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

let MOCK_USER_INSTANCE: User = createUser(Users.johnDoe);
export const mockUserContext: Map<symbol, UserContext> = new Map([
    [USER_KEY, () => MOCK_USER_INSTANCE],
]);
export function setContextUser(userData: Partial<User>) {
    MOCK_USER_INSTANCE = createUser(userData);
}
export function resetUserContext() {
    MOCK_USER_INSTANCE = createUser(Users.johnDoe);
}
