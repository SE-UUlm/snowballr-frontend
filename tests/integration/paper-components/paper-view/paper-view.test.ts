import { render, screen, waitFor } from "@testing-library/svelte";
import { assert, describe, expect, test } from "vitest";
import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";
import {
    createNonProjectPaperViewProps,
    createPaperViewProps,
    createProject,
    createProjectPaperViewProps,
    createProjectSettings,
    loading,
} from "../../../model-builder";
import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
import { waitForComponentLoading } from "../../test-helper";

describe("PaperView", () => {
    test("When `showButtonBar` is false, then button bar isn't shown", () => {
        render(
            PaperView,
            createPaperViewProps({
                showButtonBar: false,
            }),
        );

        assert.throws(() => screen.getByTestId("button-bar"));
    });

    test("When `showButtonBar` is true, then navigation buttons are shown", () => {
        render(
            PaperView,
            createPaperViewProps({
                showButtonBar: true,
            }),
        );

        const navButtons = screen.getAllByTestId("navigation-button");
        expect(navButtons).toHaveLength(2);
    });

    test("When navigation buttons are shown and `reviewMode.isActivated` is true, then the decision buttons are shown", async () => {
        reviewMode.isActivated = true;

        render(
            PaperView,
            createPaperViewProps(
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
                }),
            ),
        );

        await waitFor(() => {
            const decisionButtons = screen.getAllByTestId("decision-button");
            expect(decisionButtons).toHaveLength(3);
            expect(decisionButtons[0]).toHaveTextContent("Decline");
            expect(decisionButtons[1]).toHaveTextContent("Maybe");
            expect(decisionButtons[2]).toHaveTextContent("Accept");
        });
    });

    test("When navigation and decision buttons are shown but `project.settings.reviewMaybeAllowed` is false, then only the accept and decline buttons are shown", async () => {
        reviewMode.isActivated = true;

        render(
            PaperView,
            createPaperViewProps(
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
                }),
            ),
        );

        await waitForComponentLoading();

        const decisionButtons = screen.getAllByTestId("decision-button");
        expect(decisionButtons).toHaveLength(2);
        expect(document.body).not.toHaveTextContent("Maybe");
    });

    test("When non-project paper view is shown, then review information tab is not shown", () => {
        render(PaperView, createPaperViewProps({}, createNonProjectPaperViewProps()));

        const reviewInfoTab = screen.queryByText("Review Information");
        expect(reviewInfoTab).toBeNull();
    });
});
