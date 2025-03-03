import ReviewersSelect from "$lib/components/composites/select/ReviewersSelect.svelte";
import { type User } from "$lib/model/api/user";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { Users } from "../../example-data";

describe("ReviewersSelect", () => {
    beforeEach(() => {
        // Apparently, these methods are not implemented in jsdom but used by the Select component
        // See https://github.com/testing-library/user-event/discussions/1087
        // They are necessary when clicking the select trigger
        window.HTMLElement.prototype.hasPointerCapture = () => true;
        window.HTMLElement.prototype.releasePointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    test("When all props are provided, then component is shown correctly", async () => {
        render(ReviewersSelect, {
            target: document.body,
            props: {
                loadingReviewers: Promise.resolve<User[]>([Users.johnDoe, Users.janeDoe]),
                selectedReviewers: [],
            },
        });

        const trigger = await screen.findByText("All Reviewers (2)");
        expect(trigger).toBeInTheDocument();
    });

    test("When the loadingReviewers promise is rejected, then hint is shown", async () => {
        const user = userEvent.setup();
        render(ReviewersSelect, {
            target: document.body,
            props: {
                loadingReviewers: Promise.reject("Error"),
                selectedReviewers: [],
            },
        });

        const trigger = await screen.findByText("All Reviewers (0)");
        expect(trigger).toBeInTheDocument();

        await user.click(trigger);

        const option = screen.getByText("No reviewers available");
        expect(option).toBeInTheDocument();
    });
});
