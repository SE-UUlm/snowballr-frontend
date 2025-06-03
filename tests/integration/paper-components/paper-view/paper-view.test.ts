import { render, screen, within } from "@testing-library/svelte";
import { assert, describe, expect, test } from "vitest";
import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";
import {
    createNonProjectPaperViewProps,
    createPaperViewProps,
    createProject,
    createProjectPaper,
    createProjectPaperViewProps,
    createProjectSettings,
    loading,
} from "$tests/model-builder";
import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
import {
    mockSelectedCriteriaContextWithInitialData,
    mockUserContext,
    waitForComponentLoading,
    type SelectedCriteriaContextValue,
    type WasReviewedContextValue,
} from "$tests/integration/test-helper";
import { PaperDecision } from "$lib/model/api/project";
import { Criteria, Reviews } from "$tests/example-data";
import type { User } from "$lib/model/api/user";

describe("PaperView", () => {
    test("When `showButtonBar` is false, then button bar isn't shown", () => {
        render(PaperView, {
            props: createPaperViewProps({
                showButtonBar: false,
            }),
            context: mockUserContext,
        });

        assert.throws(() => screen.getByTestId("button-bar"));
    });

    test("When `showButtonBar` is true, then navigation buttons are shown", () => {
        render(PaperView, {
            props: createPaperViewProps({
                showButtonBar: true,
            }),
            context: mockUserContext,
        });

        const navButtons = screen.getAllByTestId("navigation-button");
        expect(navButtons).toHaveLength(2);
    });

    test("When the user is in review mode, then the decision buttons are shown", async () => {
        reviewMode.isActivated = true;

        render(PaperView, {
            props: createPaperViewProps(
                {
                    showButtonBar: true,
                },
                createProjectPaperViewProps({
                    loadingProject: loading(
                        createProject({
                            settings: createProjectSettings({
                                reviewMaybeAllowed: true,
                            }),
                        }),
                    ),
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
            (() => User) | SelectedCriteriaContextValue | WasReviewedContextValue
        >([...userContext, ...criteriaContext]);

        render(PaperView, {
            props: createPaperViewProps(
                {
                    showButtonBar: true,
                },
                createProjectPaperViewProps({
                    loadingProject: loading(
                        createProject({
                            settings: createProjectSettings({
                                reviewMaybeAllowed: true,
                            }),
                        }),
                    ),
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

    test("When navigation and decision buttons are shown but `project.settings.reviewMaybeAllowed` is false, then only the accept and decline buttons are shown", async () => {
        reviewMode.isActivated = true;

        render(PaperView, {
            props: createPaperViewProps(
                {
                    showButtonBar: true,
                },
                createProjectPaperViewProps({
                    loadingProject: loading(
                        createProject({
                            settings: createProjectSettings({
                                reviewMaybeAllowed: false,
                            }),
                        }),
                    ),
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

    test("When non-project paper view is shown, then review information tab is not shown", () => {
        render(PaperView, {
            props: createPaperViewProps({}, createNonProjectPaperViewProps()),
            context: mockUserContext,
        });

        const reviewInfoTab = screen.queryByText("Review Information");
        expect(reviewInfoTab).toBeNull();
    });
});
