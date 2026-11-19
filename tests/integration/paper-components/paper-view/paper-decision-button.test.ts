import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, onTestFinished, test, vi } from "vitest";
import PaperDecisionButton from "$lib/components/composites/paper-components/paper-view/PaperDecisionButton.svelte";
import userEvent from "@testing-library/user-event";
import { client } from "$lib/api/client";
import { Review, ReviewDecision } from "snowballr-api/review";
import { getReturnValue, mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import {
    type IsProjectArchivedContext,
    mockIsProjectArchivedContext,
    mockSelectedCriteriaContextWithInitialData,
    type SelectedCriteriaContext,
    type WasReviewedContext,
} from "$tests/integration/test-helper";
import { ProjectPapers } from "$tests/example-data";
import { projectPaperLoading } from "$lib/global-state/project-paper-loading-state.svelte";
import { goto } from "$app/navigation";
import { toast } from "svelte-sonner";
import { createProject, createProjectPaper, createReview } from "$tests/model-builder";

vi.mock("svelte-sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

type CombinedContext = SelectedCriteriaContext | WasReviewedContext | IsProjectArchivedContext;

describe("PaperDecisionButton", () => {
    test("When the variant is 'accept', then button is visualized and acts as the accept button ", async () => {
        const mockCall = vi.spyOn(client, "createReview").mockClear();

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
        expect(mockCall).toHaveBeenCalledExactlyOnceWith({
            projectPaperId: ProjectPapers.demoProjectPaper1.id,
            decision: ReviewDecision.ACCEPTED,
            selectedCriteriaIds: ["1"],
        });
        const submittedReview = await getReturnValue<Review>(mockCall);
        expect(submittedReview).toMatchObject(
            createReview({ decision: ReviewDecision.ACCEPTED, selectedCriteriaIds: ["1"] }),
        );
    });

    test("When the variant is 'decline', then button is visualized and acts as the decline button ", async () => {
        const mockCall = vi.spyOn(client, "createReview").mockClear();

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
        expect(mockCall).toHaveBeenCalledExactlyOnceWith({
            projectPaperId: ProjectPapers.demoProjectPaper1.id,
            decision: ReviewDecision.DECLINED,
            selectedCriteriaIds: ["1"],
        });
        const submittedReview = await getReturnValue<Review>(mockCall);
        expect(submittedReview).toMatchObject(
            createReview({ decision: ReviewDecision.DECLINED, selectedCriteriaIds: ["1"] }),
        );
    });

    test("When the variant is 'maybe', then button is visualized and acts as the maybe button ", async () => {
        const mockCall = vi.spyOn(client, "createReview").mockClear();

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
        expect(mockCall).toHaveBeenCalledExactlyOnceWith({
            projectPaperId: ProjectPapers.demoProjectPaper1.id,
            decision: ReviewDecision.MAYBE,
            selectedCriteriaIds: ["1"],
        });
        const submittedReview = await getReturnValue<Review>(mockCall);
        expect(submittedReview).toMatchObject(
            createReview({ decision: ReviewDecision.MAYBE, selectedCriteriaIds: ["1"] }),
        );
    });

    test("When submitting the review fails, then the button can be used again and a retry sends the same decision", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const defaultCreateReview = vi.mocked(client.createReview).getMockImplementation()!;
        onTestFinished(() => {
            vi.mocked(client.createReview).mockImplementation(defaultCreateReview);
        });
        mockFailedApiCall("createReview", "backend down", "UNAVAILABLE");
        const isSubmittingReview = { value: false };

        render(PaperDecisionButton, {
            context: new Map<symbol, CombinedContext>([
                ...mockSelectedCriteriaContextWithInitialData(["1"]),
                ...mockIsProjectArchivedContext(),
            ]),
            props: {
                variant: "accepted",
                isSubmittingReview,
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        projectPaperLoading.isLoading = false;

        const acceptButton = screen.getByRole("button");
        await waitFor(() => expect(acceptButton).toBeEnabled());
        await userEvent.click(acceptButton);

        await waitFor(() => expect(acceptButton).toBeEnabled());
        expect(acceptButton).toHaveTextContent("Accept");
        expect(acceptButton).not.toHaveClass("ring-1");
        expect(isSubmittingReview.value).toBe(false);
        expect(projectPaperLoading.isLoading).toBe(false);

        const retriedCall = mockApiCall("createReview", createReview());
        await userEvent.click(acceptButton);
        await waitFor(() =>
            expect(retriedCall).toHaveBeenCalledExactlyOnceWith({
                projectPaperId: ProjectPapers.demoProjectPaper1.id,
                decision: ReviewDecision.ACCEPTED,
                selectedCriteriaIds: ["1"],
            }),
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
    test("When the review is submitted and the next paper opens, then no 'No more papers' toast is shown", async () => {
        vi.mocked(toast.info).mockClear();
        const project = createProject();
        const currentPaper = createProjectPaper({ id: "current", localId: "1" });
        const nextPaper = createProjectPaper({ id: "next", localId: "2" });

        const { rerender } = render(PaperDecisionButton, {
            context: new Map<symbol, CombinedContext>([
                ...mockSelectedCriteriaContextWithInitialData(),
                ...mockIsProjectArchivedContext(),
            ]),
            props: {
                variant: "accepted",
                loadingProject: Promise.resolve(project),
                loadingProjectPaper: Promise.resolve(currentPaper),
                nextProjectPaper: nextPaper,
            },
        });
        projectPaperLoading.isLoading = false;
        // Like the navigation button, which forgets the neighbour once the next paper loads
        vi.mocked(goto).mockImplementationOnce(async () => {
            await rerender({ nextProjectPaper: undefined });
        });

        await userEvent.click(screen.getByRole("button", { name: /Accept/ }));

        await waitFor(() =>
            expect(goto).toHaveBeenCalledWith(`/project/${project.id}/paper/${nextPaper.localId}`),
        );
        await waitFor(() => expect(projectPaperLoading.isLoading).toBe(false));
        expect(toast.info).not.toHaveBeenCalled();
    });
});
