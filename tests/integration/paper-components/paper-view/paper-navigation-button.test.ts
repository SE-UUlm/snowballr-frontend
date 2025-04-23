import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import PaperNavigationButton from "$lib/components/composites/paper-components/paper-view/PaperNavigationButton.svelte";
import userEvent from "@testing-library/user-event";
import { Papers, Projects } from "$tests/example-data";
import { mockApiCall } from "$tests/setupTest";

describe("PaperNavigationButton", () => {
    test("When button has direction 'left', then aria-label and tooltip is 'Previous Paper'", async () => {
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "left",
                loadingPaperWrapper: Promise.resolve(Papers.demoPaper1),
                loadingProject: Promise.resolve(Projects.demoProject),
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Previous Paper");

        await userEvent.hover(button);

        await waitFor(() => {
            expect(button).toHaveAttribute("data-state", "delayed-open");
        });

        const tooltip = screen.getByText("Previous Paper");
        expect(tooltip).toBeInTheDocument();
    });

    test("When button has direction 'right', then aria-label and tooltip is 'Next Paper'", async () => {
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "right",
                loadingPaperWrapper: Promise.resolve(Papers.demoPaper1),
                loadingProject: Promise.resolve(Projects.demoProject),
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Next Paper");

        await userEvent.hover(button);

        await waitFor(() => {
            expect(button).toHaveAttribute("data-state", "delayed-open");
        });

        const tooltip = screen.getByText("Next Paper");
        expect(tooltip).toBeInTheDocument();
    });

    test("When button with direction 'right' is clicked, the button should navigate to the next paper", async () => {
        const mockCall = mockApiCall("getNextProjectPaper", {
            decision: 1,
            id: "1",
            localId: "1",
            reviews: [],
            stage: 0n,
            projectPaper: Papers.demoPaper1,
        });
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "right",
                loadingPaperWrapper: Promise.resolve(Papers.demoPaper1),
                loadingProject: Promise.resolve(Projects.demoProject),
            },
        });

        const button = screen.getByRole("button");

        await userEvent.click(button);
        expect(mockCall).toHaveBeenCalled();
    });
});
