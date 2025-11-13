import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test, vi } from "vitest";
import PaperDecisionButton from "$lib/components/composites/paper-components/paper-view/PaperDecisionButton.svelte";
import userEvent from "@testing-library/user-event";
import { createReview } from "$tests/model-builder";
import { backendService } from "$lib/grpc-api";
import { Review, ReviewDecision } from "$lib/model/api/review";
import { getReturnValue } from "$tests/setupTest";
import {
    type IsProjectArchivedContext,
    mockIsProjectArchivedContext,
    mockSelectedCriteriaContextWithInitialData,
    type SelectedCriteriaContext,
    type WasReviewedContext,
} from "$tests/integration/test-helper";
import { ProjectPapers } from "$tests/example-data";
import { projectPaperLoading } from "$lib/global-state/project-paper-loading-state.svelte";

type CombinedContext = SelectedCriteriaContext | WasReviewedContext | IsProjectArchivedContext;

describe("PaperDecisionButton", () => {
    test("When the variant is 'accept', then button is visualized and acts as the accept button ", async () => {
        const mockCall = vi.spyOn(backendService, "createReview");

        render(PaperDecisionButton, {
            context: new Map<symbol, CombinedContext>([
                ...mockSelectedCriteriaContextWithInitialData(["1"]),
                ...mockIsProjectArchivedContext(),
            ]),
            props: {
                variant: "accepted",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        projectPaperLoading.isLoading = false;

        const acceptButton = screen.getByRole("button");
        expect(acceptButton).toBeInTheDocument();
        await waitFor(() => expect(acceptButton).toHaveTextContent("Accept"));
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

    test("When the variant is 'decline', then button is visualized and acts as the decline button ", async () => {
        const mockCall = vi.spyOn(backendService, "createReview");

        render(PaperDecisionButton, {
            context: new Map<symbol, CombinedContext>([
                ...mockSelectedCriteriaContextWithInitialData(["1"]),
                ...mockIsProjectArchivedContext(),
            ]),
            props: {
                variant: "declined",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        projectPaperLoading.isLoading = false;

        const declineButton = screen.getByRole("button");
        expect(declineButton).toBeInTheDocument();
        await waitFor(() => expect(declineButton).toHaveTextContent("Decline"));
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

    test("When the variant is 'maybe', then button is visualized and acts as the maybe button ", async () => {
        const mockCall = vi.spyOn(backendService, "createReview");

        render(PaperDecisionButton, {
            context: new Map<symbol, CombinedContext>([
                ...mockSelectedCriteriaContextWithInitialData(["1"]),
                ...mockIsProjectArchivedContext(),
            ]),
            props: {
                variant: "maybe",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        projectPaperLoading.isLoading = false;

        const maybeButton = screen.getByRole("button");
        expect(maybeButton).toBeInTheDocument();
        await waitFor(() => expect(maybeButton).toHaveTextContent("Maybe"));
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

    test("When the paper decision button was already clicked, then the button is disabled", async () => {
        render(PaperDecisionButton, {
            context: new Map<symbol, CombinedContext>([
                ...mockSelectedCriteriaContextWithInitialData(),
                ...mockIsProjectArchivedContext(),
            ]),
            props: {
                variant: "accepted",
                userReview: createReview(),
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        projectPaperLoading.isLoading = false;

        const decisionButton = screen.getByRole("button", { name: /Accept/ });
        expect(decisionButton).toBeDisabled();
    });

    test("When the paper is part of a archived project, then the decision button is disabled", async () => {
        render(PaperDecisionButton, {
            context: new Map<symbol, CombinedContext>([
                ...mockSelectedCriteriaContextWithInitialData(),
                ...mockIsProjectArchivedContext(true),
            ]),
            props: {
                variant: "accepted",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        projectPaperLoading.isLoading = false;

        const decisionButton = screen.getByRole("button", { name: /Accept/ });
        expect(decisionButton).toBeDisabled();
    });
});
