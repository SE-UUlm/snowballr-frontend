import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import PaperDecisionButton from "$lib/components/composites/paper-components/paper-view/PaperDecisionButton.svelte";
import userEvent from "@testing-library/user-event";

describe("PaperDecisionButton", () => {
    test("When variant is 'accept', then button is visualized and acts as the accept button ", async () => {
        render(PaperDecisionButton, {
            props: {
                projectPaperId: "1",
                variant: "accept",
            },
        });

        const acceptButton = screen.getByRole("button");
        expect(acceptButton).toBeInTheDocument();
        expect(acceptButton).toHaveTextContent("Accept");
        expect(acceptButton).toHaveClass("bg-accept-green");

        await userEvent.hover(acceptButton);
        await waitFor(() => expect(acceptButton).toHaveAttribute("data-state", "delayed-open"));
        expect(screen.getByText("Accept paper")).toBeInTheDocument();
    });

    test("When variant is 'decline', then button is visualized and acts as the decline button ", async () => {
        render(PaperDecisionButton, {
            props: {
                projectPaperId: "1",
                variant: "decline",
            },
        });

        const declineButton = screen.getByRole("button");
        expect(declineButton).toBeInTheDocument();
        expect(declineButton).toHaveTextContent("Decline");
        expect(declineButton).toHaveClass("bg-decline-red");

        await userEvent.hover(declineButton);
        await waitFor(() => expect(declineButton).toHaveAttribute("data-state", "delayed-open"));
        expect(screen.getByText("Decline paper")).toBeInTheDocument();
    });

    test("When variant is 'maybe', then button is visualized and acts as the maybe button ", async () => {
        render(PaperDecisionButton, {
            props: {
                projectPaperId: "1",
                variant: "maybe",
            },
        });

        const maybeButton = screen.getByRole("button");
        expect(maybeButton).toBeInTheDocument();
        expect(maybeButton).toHaveTextContent("Maybe");
        expect(maybeButton).toHaveClass("bg-maybe-yellow");

        await userEvent.hover(maybeButton);
        await waitFor(() => expect(maybeButton).toHaveAttribute("data-state", "delayed-open"));
        expect(screen.getByText("Mark paper as undecided")).toBeInTheDocument();
    });
});
