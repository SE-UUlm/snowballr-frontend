import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import PaperBookmarkButton from "$lib/components/composites/PaperBookmarkButton.svelte";
import userEvent from "@testing-library/user-event";

describe("PaperBookmarkButton", () => {
    test("When paper is not bookmarked, then bookmark button has 'Add to reading list' tooltip", () => {
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                loadingPaperId: Promise.resolve("1"),
                isBookmarkedDefault: false,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("data-state", "closed");
        expect(button).toHaveAttribute("aria-label", "Add to reading list");
    });

    test("When paper is bookmarked, then bookmark button has 'Remove from reading list' tooltip", () => {
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                loadingPaperId: Promise.resolve("1"),
                isBookmarkedDefault: true,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("data-state", "closed");
        expect(button).toHaveAttribute("aria-label", "Remove from reading list");
    });

    test("When button is not bookmarked and hovered, then button has 'Add to reading list' tooltip", async () => {
        const user = userEvent.setup();
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                loadingPaperId: Promise.resolve("1"),
                isBookmarkedDefault: false,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Add to reading list");
        await user.hover(button);

        await waitFor(() => {
            expect(button).toHaveAttribute("data-state", "delayed-open");
        });

        const tooltip = screen.getByText("Add to reading list");
        expect(tooltip).toBeInTheDocument();
    });

    test("When button is bookmarked and hovered, then button has 'Remove from reading list' tooltip", async () => {
        const user = userEvent.setup();
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                loadingPaperId: Promise.resolve("1"),
                isBookmarkedDefault: true,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Remove from reading list");
        await user.hover(button);

        await waitFor(() => {
            expect(button).toHaveAttribute("data-state", "delayed-open");
        });

        const tooltip = screen.getByText("Remove from reading list");
        expect(tooltip).toBeInTheDocument();
    });
});
