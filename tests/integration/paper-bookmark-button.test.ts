import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test, vi } from "vitest";
import PaperBookmarkButton from "$lib/components/composites/PaperBookmarkButton.svelte";
import userEvent from "@testing-library/user-event";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("PaperBookmarkButton", () => {
    test("When the paper is not bookmarked, then bookmark button has 'Add to reading list' tooltip", () => {
        mockApiCall("isPaperOnReadingList", { value: false });
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

    test("When the paper is bookmarked, then the bookmark button has a 'Remove from reading list' tooltip", () => {
        mockApiCall("isPaperOnReadingList", { value: true });
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

    test("When the button is not bookmarked and hovered, then button has 'Add to reading list' tooltip", async () => {
        mockApiCall("isPaperOnReadingList", { value: false });
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

    test("When the button is bookmarked and hovered, then button has 'Remove from reading list' tooltip", async () => {
        mockApiCall("isPaperOnReadingList", { value: true });
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

    test("When the button is clicked, then the bookmark state is toggled", async () => {
        mockApiCall("isPaperOnReadingList", { value: false }); // initially not bookmarked
        mockApiCall("addPaperToReadingList", {});
        mockApiCall("removePaperFromReadingList", {});

        const user = userEvent.setup();
        const testFunction = vi.fn();
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                loadingPaperId: Promise.resolve("1"),
                isBookmarkedDefault: false,
                onPaperChangedBookmarkStatus: testFunction,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Add to reading list");

        await user.click(button);
        expect(button).toHaveAttribute("aria-label", "Remove from reading list");

        mockApiCall("isPaperOnReadingList", { value: true }); // now bookmarked

        await user.click(button);
        expect(button).toHaveAttribute("aria-label", "Add to reading list");

        // Check that the callback function was called twice (once for each click)
        expect(testFunction).toHaveBeenCalledTimes(2);
    });

    test("When the button is clicked and the API call fails, then the bookmark state is not toggled", async () => {
        mockApiCall("isPaperOnReadingList", { value: false }); // initially not bookmarked
        mockFailedApiCall("addPaperToReadingList");

        const user = userEvent.setup();
        const testFunction = vi.fn();
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                loadingPaperId: Promise.resolve("1"),
                isBookmarkedDefault: false,
                onPaperChangedBookmarkStatus: testFunction,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Add to reading list");

        await user.click(button);
        expect(button).toHaveAttribute("aria-label", "Add to reading list");

        // Check that the callback function was not called
        expect(testFunction).not.toHaveBeenCalled();
    });
});
