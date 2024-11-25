import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import PaperNavigationButton from "$lib/components/composites/paper-components/paper-view/PaperNavigationButton.svelte";
import userEvent from "@testing-library/user-event";

describe("PaperNavigationButton", () => {
    test("When button has direction 'left', then aria-lable and tooltip is 'Previous Paper'", async () => {
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "left",
                href: "/somewhere",
                onClick: () => {},
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

    test("When button has direction 'right', then aria-lable and tooltip is 'Next Paper'", async () => {
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "right",
                href: "/somewhere",
                onClick: () => {},
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

    test("When button is clicked, then onClick is executed", async () => {
        let clicked = false;
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "left",
                href: "",
                onClick: () => {
                    clicked = true;
                },
            },
        });

        const button = screen.getByRole("button");

        await userEvent.click(button);
        expect(clicked).toBe(true);
    });
});
