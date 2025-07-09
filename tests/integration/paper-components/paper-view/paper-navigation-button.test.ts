import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import PaperNavigationButton from "$lib/components/composites/paper-components/paper-view/PaperNavigationButton.svelte";
import userEvent from "@testing-library/user-event";
import { ProjectPapers } from "$tests/example-data";
import { mockApiCall } from "$tests/setupTest";
import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
import { projectPaperLoading } from "$lib/global-state/project-paper-loading-state.svelte";

describe("PaperNavigationButton", () => {
    test("When button has direction 'left', then aria-label and tooltip is 'Previous Paper'", async () => {
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "left",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        reviewMode.isActivated = false;
        projectPaperLoading.isLoading = false;
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Previous Paper");

        await userEvent.hover(button);

        await waitFor(() => {
            expect(button).toHaveAttribute("data-state", "delayed-open");
        });

        const tooltip = screen.getByText("Previous Paper");
        expect(tooltip).toBeInTheDocument();
    });

    test("When button with direction 'left' is clicked, the button should navigate to the previous paper", async () => {
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "left",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        reviewMode.isActivated = false;
        projectPaperLoading.isLoading = false;
        const mockCallPreviousPaper = mockApiCall("getPreviousPaper", {
            ...ProjectPapers.demoProjectPaper1,
        });
        await waitFor(() => {
            expect(mockCallPreviousPaper).toHaveBeenCalledTimes(1);
        });
    });

    test("When button has direction 'right', then aria-label and tooltip is 'Next Paper'", async () => {
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "right",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        reviewMode.isActivated = false;
        projectPaperLoading.isLoading = false;
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Next Paper");

        await userEvent.hover(button);

        await waitFor(() => {
            expect(button).toHaveAttribute("data-state", "delayed-open");
        });

        const tooltip = screen.getByText("Next Paper");
        expect(tooltip).toBeInTheDocument();
    });

    test("When button with direction 'right' is clicked, the button should navigate to the next paper to review", async () => {
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "right",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        reviewMode.isActivated = false;
        projectPaperLoading.isLoading = false;
        const mockCallNextPaper = mockApiCall("getNextPaper", {
            ...ProjectPapers.demoProjectPaper1,
        });
        await waitFor(() => {
            expect(mockCallNextPaper).toHaveBeenCalledTimes(1);
        });
    });

    test("When button with direction 'right' is clicked, the button should navigate to the next paper to review", async () => {
        reviewMode.isActivated = true;
        const mockCallNextPaperToReview = mockApiCall("getNextPaperToReview", {
            ...ProjectPapers.demoProjectPaper1,
        });
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "right",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        projectPaperLoading.isLoading = false;
        await waitFor(() => {
            expect(mockCallNextPaperToReview).toHaveBeenCalledTimes(1);
        });
    });
});
