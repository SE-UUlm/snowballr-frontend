import { render, screen, within } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import ProjectPaperView from "$lib/components/composites/paper-components/paper-view/ProjectPaperView.svelte";
import {
    createProject,
    createProjectPaper,
    createProjectSpecificPaperViewProps,
    createProjectSettings,
    loading,
    createProjectPaperViewProps,
} from "$tests/model-builder";
import {
    mockSelectedCriteriaContextWithInitialData,
    mockUserContext,
    waitForComponentLoading,
    type SelectedCriteriaContext,
    type WasReviewedContext,
    mockIsProjectArchivedContext,
    type IsProjectArchivedContext,
} from "$tests/integration/test-helper";
import { Criteria, Reviews } from "$tests/example-data";
import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
import type { UserContext } from "$lib/custom-context/user-context";
import { PaperDecision } from "$api/project";

describe("ProjectPaperView", () => {
    test("When the user already reviewed this paper but is in review mode, then the decision is shown", async () => {
        reviewMode.isActivated = true;

        const userContext = mockUserContext;
        const criteriaContext = mockSelectedCriteriaContextWithInitialData([], true);
        const isProjectArchivedContext = mockIsProjectArchivedContext();
        const combinedContext = new Map<
            symbol,
            UserContext | SelectedCriteriaContext | WasReviewedContext | IsProjectArchivedContext
        >([...userContext, ...criteriaContext, ...isProjectArchivedContext]);

        render(ProjectPaperView, {
            props: createProjectPaperViewProps(
                {
                    loadingProject: loading(
                        createProject({
                            settings: createProjectSettings({
                                reviewMaybeAllowed: true,
                            }),
                        }),
                    ),
                },
                undefined,
                createProjectSpecificPaperViewProps({
                    loadingPaper: loading(
                        createProjectPaper({
                            reviews: [Reviews.demoReview1],
                            decision: PaperDecision.DECLINED,
                        }),
                    ),
                    criteriaWithReviews: loading([{ ...Criteria.demoCriterion1, reviews: [] }]),
                }),
            ),
            context: combinedContext,
        });

        await waitForComponentLoading();

        const decisionButtons = screen.getAllByTestId("decision-button", { exact: false });
        expect(decisionButtons).toHaveLength(3);
        decisionButtons.forEach((button) => expect(button).toBeDisabled());
        expect(decisionButtons[0]).toHaveClass("ring-1");

        const selectedCriteria = screen.getByRole("listitem");
        expect(selectedCriteria).toBeInTheDocument();
        const checkbox = within(selectedCriteria).getByRole("checkbox");
        expect(checkbox).toBeDisabled();
        expect(checkbox).toBeChecked();
    });
});
