import ReviewersSelect from "$lib/components/composites/papers-view/ReviewersSelect.svelte";
import { UserRole, UserStatus, type User } from "$lib/model/api/user";
import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

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
                loadingReviewers: Promise.resolve<User[]>([
                    {
                        id: "1",
                        firstName: "first1",
                        lastName: "last1",
                        email: "email1",
                        status: UserStatus.ACTIVE,
                        role: UserRole.DEFAULT,
                    },
                    {
                        id: "2",
                        firstName: "first2",
                        lastName: "last2",
                        email: "email2",
                        status: UserStatus.ACTIVE,
                        role: UserRole.DEFAULT,
                    },
                ]),
                selectedReviewers: [],
            },
        });

        await waitFor(() => {
            const trigger = screen.getByText("All Reviewers (2)");
            expect(trigger).toBeInTheDocument();
        });
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

        let trigger: HTMLElement;
        await waitFor(() => {
            trigger = screen.getByText("All Reviewers (0)");
            expect(trigger).toBeInTheDocument();
        });
        assert(trigger!);

        await user.click(trigger);

        const option = screen.getByText("No reviewers available");
        expect(option).toBeInTheDocument();
    });
});
