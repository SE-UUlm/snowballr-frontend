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
    type SelectedCriteriaContextValue,
    type WasReviewedContextValue,
} from "$tests/integration/test-helper";
import { Criteria, Reviews } from "$tests/example-data";
import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
import type { UserContext } from "$lib/current-user/userContext";
import { PaperDecision } from "$lib/model/api/project";

describe("ProjectPaperView", () => {
    test("When the user is in review mode, then the decision buttons are shown", async () => {
        reviewMode.isActivated = true;

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
                    loadingPaper: loading(createProjectPaper()),
                    criteriaWithReviews: loading([{ ...Criteria.demoCriterion1, reviews: [] }]),
                }),
            ),
            context: mockUserContext,
        });

        await waitForComponentLoading();

        const decisionButtons = screen.getAllByTestId("decision-button", { exact: false });
        expect(decisionButtons).toHaveLength(3);
        expect(decisionButtons[0]).toHaveTextContent("Decline");
        expect(decisionButtons[1]).toHaveTextContent("Maybe");
        expect(decisionButtons[2]).toHaveTextContent("Accept");
    });

    test("When the user already reviewed this paper but is in review mode, then the decision is shown", async () => {
        reviewMode.isActivated = true;

        const userContext = mockUserContext;
        const criteriaContext = mockSelectedCriteriaContextWithInitialData([], true);
        const combinedContext = new Map<
            symbol,
            UserContext | SelectedCriteriaContextValue | WasReviewedContextValue
        >([...userContext, ...criteriaContext]);

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

    test("When `project.settings.reviewMaybeAllowed` is false, then only the accept and decline buttons are shown", async () => {
        reviewMode.isActivated = true;

        render(ProjectPaperView, {
            props: createProjectPaperViewProps(
                {
                    loadingProject: loading(
                        createProject({
                            settings: createProjectSettings({
                                reviewMaybeAllowed: false,
                            }),
                        }),
                    ),
                },
                undefined,
                createProjectSpecificPaperViewProps({
                    loadingPaper: loading(createProjectPaper()),
                    criteriaWithReviews: loading([{ ...Criteria.demoCriterion1, reviews: [] }]),
                }),
            ),
            context: mockUserContext,
        });

        await waitForComponentLoading();

        const decisionButtons = screen.getAllByTestId("decision-button", { exact: false });
        expect(decisionButtons).toHaveLength(2);
        expect(document.body).not.toHaveTextContent("Maybe");
    });
});
