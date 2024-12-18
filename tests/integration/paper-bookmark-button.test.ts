import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import PaperBookmarkButton from "$lib/components/composites/PaperBookmarkButton.svelte";
import userEvent from "@testing-library/user-event";

describe("PaperBookmarkButton", () => {
    test("When paper is not bookmarked, then bookmark button has 'Add to Reading List' tooltip", () => {
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                paperId: 1,
                isBookmarkedDefault: false,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("data-state", "closed");
        expect(button).toHaveAttribute("aria-label", "Add to Reading List");
    });

    test("When paper is bookmarked, then bookmark button has 'Remove from Reading List' tooltip", () => {
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                paperId: 1,
                isBookmarkedDefault: true,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("data-state", "closed");
        expect(button).toHaveAttribute("aria-label", "Remove from Reading List");
    });

    test("When button is not bookmarked and hovered, then button has 'Add to Reading List' tooltip", async () => {
        const user = userEvent.setup();
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                paperId: 1,
                isBookmarkedDefault: false,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Add to Reading List");
        await user.hover(button);

        await waitFor(() => {
            expect(button).toHaveAttribute("data-state", "delayed-open");
        });

        const tooltip = screen.getByText("Add to Reading List");
        expect(tooltip).toBeInTheDocument();
    });

    test("When button is bookmarked and hovered, then button has 'Remove from Reading List' tooltip", async () => {
        const user = userEvent.setup();
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                paperId: 1,
                isBookmarkedDefault: true,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Remove from Reading List");
        await user.hover(button);

        await waitFor(() => {
            expect(button).toHaveAttribute("data-state", "delayed-open");
        });

        const tooltip = screen.getByText("Remove from Reading List");
        expect(tooltip).toBeInTheDocument();
    });
});
