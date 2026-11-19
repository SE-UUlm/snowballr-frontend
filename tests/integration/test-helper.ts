import { waitFor, screen } from "@testing-library/svelte";
import { expect } from "vitest";
import { WAS_PROJECT_PAPER_ALREADY_REVIEWED_KEY } from "$lib/custom-context/was-paper-reviewed-context";
import { SELECTED_REVIEW_CRITERIA_KEY } from "$lib/custom-context/selected-review-criteria-context";
import type { User } from "snowballr-api/user";
import { USER_KEY, type UserContext } from "$lib/custom-context/user-context";
import { createUser } from "$tests/model-builder";
import { Users } from "$tests/example-data";
import { IS_PROJECT_ARCHIVED_KEY } from "$lib/custom-context/is-project-archived-context";

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

/**
 * Awaits until an open dialog or alert dialog has moved the focus into itself.
 *
 * The dialog focuses itself one animation frame after it opens. Keystrokes typed into one of its
 * inputs before that frame are lost once the focus jumps, so call this after opening the dialog and
 * before interacting with it.
 */
export function waitForDialogFocus(): Promise<void> {
    return waitFor(() => {
        const focusedDialog = document.activeElement?.closest(
            '[role="dialog"], [role="alertdialog"]',
        );
        expect(focusedDialog, "The focus is not inside a dialog").toBeTruthy();
    });
}

export interface SelectedCriteriaContext {
    criteria: string[];
}
export interface WasReviewedContext {
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
    new Map<symbol, SelectedCriteriaContext | WasReviewedContext>([
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

export interface IsProjectArchivedContext {
    isProjectArchived: boolean;
}
export const mockIsProjectArchivedContext = (isProjectArchived = false) =>
    new Map<symbol, IsProjectArchivedContext>([[IS_PROJECT_ARCHIVED_KEY, { isProjectArchived }]]);
