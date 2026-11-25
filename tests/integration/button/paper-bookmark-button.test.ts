import { render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, describe, expect, test, vi } from "vitest";
import PaperBookmarkButton from "#lib/components/composites/button/PaperBookmarkButton.svelte";
import userEvent from "@testing-library/user-event";
import { mockApiCall, mockFailedApiCall, mockPendingApiCall } from "#tests/setupTest.js";

describe("PaperBookmarkButton", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("When the paper is not bookmarked, then bookmark button has 'Add to reading list' tooltip", () => {
        mockApiCall("isPaperOnReadingList", { value: false });
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                paperId: "1",
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
                paperId: "1",
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
                paperId: "1",
                isBookmarkedDefault: false,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Add to reading list");
        await user.hover(button);

        await waitFor(() => {
            expect(button).toHaveAttribute("data-state", "instant-open");
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
                paperId: "1",
                isBookmarkedDefault: true,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Remove from reading list");
        await user.hover(button);

        await waitFor(() => {
            expect(button).toHaveAttribute("data-state", "instant-open");
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
                paperId: "1",
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

    test("When the button is clicked and the addToPaperList API call fails, then the button is not toggled", async () => {
        mockApiCall("isPaperOnReadingList", { value: false }); // initially not bookmarked
        mockFailedApiCall("addPaperToReadingList");

        const user = userEvent.setup();
        const testFunction = vi.fn();
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                paperId: "1",
                isBookmarkedDefault: false,
                onPaperChangedBookmarkStatus: testFunction,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Add to reading list");

        await user.click(button);
        expect(button).toHaveAttribute("aria-label", "Add to reading list");

        expect(testFunction).not.toHaveBeenCalled();
    });

    test("When the button is clicked and the removeFromPaperList API call fails, then the button is not toggled", async () => {
        mockApiCall("isPaperOnReadingList", { value: true }); // initially bookmarked
        mockFailedApiCall("removePaperFromReadingList");

        const user = userEvent.setup();
        const testFunction = vi.fn();
        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                paperId: "1",
                isBookmarkedDefault: true,
                onPaperChangedBookmarkStatus: testFunction,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Remove from reading list");

        await user.click(button);
        expect(button).toHaveAttribute("aria-label", "Remove from reading list");

        expect(testFunction).not.toHaveBeenCalled();
    });

    test("When the isPaperOnReadingList API call fails, then the button stays disabled", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const statusCall = mockFailedApiCall("isPaperOnReadingList");

        render(PaperBookmarkButton, {
            target: document.body,
            props: {
                paperId: "1",
                isBookmarkedDefault: false,
            },
        });

        // Wait until the failure was handled, so the assertion sees the state after the call settled
        await waitFor(() => expect(consoleError).toHaveBeenCalled());
        expect(statusCall).toHaveBeenCalledOnce();
        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute("aria-label", "Couldn't load reading list status");
    });

    test("When the paperId changes, then the button is disabled until the new status arrives", async () => {
        mockApiCall("isPaperOnReadingList", { value: false });
        const { rerender } = render(PaperBookmarkButton, {
            target: document.body,
            props: { paperId: "1" },
        });
        const button = screen.getByRole("button");
        await waitFor(() => expect(button).toBeEnabled());

        const { call, resolve } = mockPendingApiCall("isPaperOnReadingList");
        await rerender({ paperId: "2" });

        expect(call).toHaveBeenCalledWith({ id: "2" });
        expect(button).toBeDisabled();

        resolve({ value: true });
        await waitFor(() => expect(button).toBeEnabled());
        expect(button).toHaveAttribute("aria-label", "Remove from reading list");
    });

    test("When adding the paper is cancelled, then no error is logged and the button is not toggled", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        mockApiCall("isPaperOnReadingList", { value: false });
        const addCall = mockFailedApiCall("addPaperToReadingList", "", "CANCELLED");

        const user = userEvent.setup();
        render(PaperBookmarkButton, {
            target: document.body,
            props: { paperId: "1" },
        });
        const button = screen.getByRole("button");
        await waitFor(() => expect(button).toBeEnabled());

        await user.click(button);

        await waitFor(() => expect(button).toBeEnabled());
        expect(addCall).toHaveBeenCalledOnce();
        expect(button).toHaveAttribute("aria-label", "Add to reading list");
        expect(consoleError).not.toHaveBeenCalled();
    });
});
