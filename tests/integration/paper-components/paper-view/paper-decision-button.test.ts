import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test, vi } from "vitest";
import PaperDecisionButton from "$lib/components/composites/paper-components/paper-view/PaperDecisionButton.svelte";
import userEvent from "@testing-library/user-event";
import { createReview } from "$tests/model-builder";
import { SELECTED_REVIEW_CRITERIA_KEY } from "$lib/utils/custom-context";
import { backendService } from "$lib/grpc-api";
import { Review, ReviewDecision } from "$lib/model/api/review";
import { getReturnValue } from "$tests/setupTest";

describe("PaperDecisionButton", () => {
    test("When variant is 'accept', then button is visualized and acts as the accept button ", async () => {
        const mockCall = vi.spyOn(backendService, "createReview");

        render(PaperDecisionButton, {
            context: new Map([[SELECTED_REVIEW_CRITERIA_KEY, { criteria: ["1"] }]]),
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
        const tooltip = screen.getByText("Accept paper");
        expect(tooltip).toBeInTheDocument();

        await userEvent.click(acceptButton);
        expect(mockCall).toHaveBeenCalled();
        const submittedReview = await getReturnValue<Review>(mockCall);
        expect(submittedReview).toMatchObject(
            createReview({ decision: ReviewDecision.ACCEPTED, selectedCriteriaIds: ["1"] }),
        );
    });

    test("When variant is 'decline', then button is visualized and acts as the decline button ", async () => {
        const mockCall = vi.spyOn(backendService, "createReview");

        render(PaperDecisionButton, {
            context: new Map([[SELECTED_REVIEW_CRITERIA_KEY, { criteria: ["1"] }]]),
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
        const tooltip = screen.getByText("Decline paper");
        expect(tooltip).toBeInTheDocument();

        await userEvent.click(declineButton);
        expect(mockCall).toHaveBeenCalled();
        const submittedReview = await getReturnValue<Review>(mockCall);
        expect(submittedReview).toMatchObject(
            createReview({ decision: ReviewDecision.DECLINED, selectedCriteriaIds: ["1"] }),
        );
    });

    test("When variant is 'maybe', then button is visualized and acts as the maybe button ", async () => {
        const mockCall = vi.spyOn(backendService, "createReview");

        render(PaperDecisionButton, {
            context: new Map([[SELECTED_REVIEW_CRITERIA_KEY, { criteria: ["1"] }]]),
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
        const tooltip = screen.getByText("Mark paper as undecided");
        expect(tooltip).toBeInTheDocument();

        await userEvent.click(maybeButton);
        expect(mockCall).toHaveBeenCalled();
        const submittedReview = await getReturnValue<Review>(mockCall);
        expect(submittedReview).toMatchObject(
            createReview({ decision: ReviewDecision.MAYBE, selectedCriteriaIds: ["1"] }),
        );
    });

    test("When paper decision was already clicked, then the button is disabled", async () => {
        render(PaperDecisionButton, {
            props: {
                projectPaperId: "1",
                variant: "accept",
                userReview: createReview(),
            },
        });

        const decisionButton = screen.getByRole("button", { name: /Accept/ });
        expect(decisionButton).toBeDisabled();
    });
});
