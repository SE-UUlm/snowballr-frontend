import { render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, type Mock, test, vi } from "vitest";
import PaperNavigationButton from "$lib/components/composites/paper-components/paper-view/PaperNavigationButton.svelte";
import userEvent from "@testing-library/user-event";
import { ProjectPapers } from "$tests/example-data";
import { mockApiCall, mockFailedApiCall, mockUnaryCall } from "$tests/setupTest";
import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
import { projectPaperLoading } from "$lib/global-state/project-paper-loading-state.svelte";
import { backendService } from "$lib/grpc-api";
import { createProject, createProjectPaper } from "$tests/model-builder";
import { goto } from "$app/navigation";
import { toast } from "svelte-sonner";
import type { Project_Paper } from "snowballr-api/project";

vi.mock("svelte-sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

describe("PaperNavigationButton", () => {
    test("When button has direction 'left', then aria-label and tooltip is 'Previous Paper'", async () => {
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "left",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        reviewMode.isActivated = false;
        projectPaperLoading.isLoading = false;
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Previous Paper");

        await userEvent.hover(button);

        await waitFor(() => {
            expect(button).toHaveAttribute("data-state", "delayed-open");
        });

        const tooltip = screen.getByText("Previous Paper");
        expect(tooltip).toBeInTheDocument();
    });

    test("When button with direction 'left' is clicked, the button should navigate to the previous paper", async () => {
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "left",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        reviewMode.isActivated = false;
        projectPaperLoading.isLoading = false;
        const mockCallPreviousPaper = mockApiCall("getPreviousPaper", {
            ...ProjectPapers.demoProjectPaper1,
        });
        await waitFor(() => {
            expect(mockCallPreviousPaper).toHaveBeenCalledTimes(1);
        });
        expect(mockCallPreviousPaper).toHaveBeenCalledWith({
            id: ProjectPapers.demoProjectPaper1.id,
        });
    });

    test("When button has direction 'right', then aria-label and tooltip is 'Next Paper'", async () => {
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "right",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        reviewMode.isActivated = false;
        projectPaperLoading.isLoading = false;
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Next Paper");

        await userEvent.hover(button);

        await waitFor(() => {
            expect(button).toHaveAttribute("data-state", "delayed-open");
        });

        const tooltip = screen.getByText("Next Paper");
        expect(tooltip).toBeInTheDocument();
    });

    test("When button with direction 'right' is clicked, the button should navigate to the next paper to review", async () => {
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "right",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        reviewMode.isActivated = false;
        projectPaperLoading.isLoading = false;
        const mockCallNextPaper = mockApiCall("getNextPaper", {
            ...ProjectPapers.demoProjectPaper1,
        });
        await waitFor(() => {
            expect(mockCallNextPaper).toHaveBeenCalledTimes(1);
        });
        expect(mockCallNextPaper).toHaveBeenCalledWith({ id: ProjectPapers.demoProjectPaper1.id });
    });

    test("When button with direction 'right' is clicked, the button should navigate to the next paper to review", async () => {
        reviewMode.isActivated = true;
        const mockCallNextPaperToReview = mockApiCall("getNextPaperToReview", {
            ...ProjectPapers.demoProjectPaper1,
        });
        render(PaperNavigationButton, {
            target: document.body,
            props: {
                direction: "right",
                loadingProjectPaper: Promise.resolve(ProjectPapers.demoProjectPaper1),
            },
        });
        projectPaperLoading.isLoading = false;
        await waitFor(() => {
            expect(mockCallNextPaperToReview).toHaveBeenCalledTimes(1);
        });
        expect(mockCallNextPaperToReview).toHaveBeenCalledWith({
            id: ProjectPapers.demoProjectPaper1.id,
        });
    });

    describe("When prefetching the neighbouring paper", () => {
        const getNextPaperMock = backendService.getNextPaper as unknown as Mock;
        let defaultGetNextPaper: ReturnType<Mock["getMockImplementation"]>;

        beforeEach(() => {
            defaultGetNextPaper = getNextPaperMock.getMockImplementation();
            reviewMode.isActivated = false;
            projectPaperLoading.isLoading = false;
            vi.mocked(toast.error).mockClear();
            vi.spyOn(console, "error").mockImplementation(() => {});
        });

        afterEach(() => {
            getNextPaperMock.mockImplementation(defaultGetNextPaper!);
            vi.restoreAllMocks();
        });

        function renderNextButton(loadingProjectPaper: Promise<Project_Paper | undefined>) {
            return render(PaperNavigationButton, {
                target: document.body,
                props: {
                    direction: "right",
                    loadingProject: Promise.resolve(createProject({ id: "project-1" })),
                    loadingProjectPaper,
                },
            });
        }

        async function expectButtonDoneLoadingAndDisabled() {
            const button = screen.getByRole("button", { name: "Next Paper" });
            await waitFor(() => expect(button.querySelector(".animate-spin")).toBeNull());
            expect(button).toBeDisabled();
        }

        test("When the current paper does not exist, then the button stops loading and is disabled", async () => {
            renderNextButton(Promise.resolve(undefined));

            await expectButtonDoneLoadingAndDisabled();
        });

        test("When loading the current paper fails, then the button stops loading and is disabled", async () => {
            renderNextButton(Promise.reject(new Error("paper not loaded")));

            await expectButtonDoneLoadingAndDisabled();
        });

        test("When there is no next paper, then the button is disabled without an error", async () => {
            mockFailedApiCall("getNextPaper", "last paper", "FAILED_PRECONDITION");

            renderNextButton(Promise.resolve(createProjectPaper({ id: "paper-1" })));

            await expectButtonDoneLoadingAndDisabled();
            expect(toast.error).not.toHaveBeenCalled();
        });

        test("When loading the next paper fails, then an error is shown", async () => {
            mockFailedApiCall("getNextPaper", "backend down", "UNAVAILABLE");

            renderNextButton(Promise.resolve(createProjectPaper({ id: "paper-1" })));

            await expectButtonDoneLoadingAndDisabled();
            expect(toast.error).toHaveBeenCalledOnce();
        });

        test("When the paper changes before its next paper is loaded, then the late response is ignored", async () => {
            const resolveNextPaperOf = new Map<string, (paper: Project_Paper) => void>();
            getNextPaperMock
                .mockClear()
                .mockImplementation(({ id }: { id: string }) =>
                    mockUnaryCall(
                        new Promise<Project_Paper>((resolve) =>
                            resolveNextPaperOf.set(id, resolve),
                        ),
                    ),
                );
            const nextOfFirst = createProjectPaper({ id: "next-of-first", localId: "11" });
            const nextOfSecond = createProjectPaper({ id: "next-of-second", localId: "22" });

            const { rerender } = renderNextButton(
                Promise.resolve(createProjectPaper({ id: "first" })),
            );
            await waitFor(() => expect(resolveNextPaperOf.has("first")).toBe(true));
            await rerender({
                loadingProjectPaper: Promise.resolve(createProjectPaper({ id: "second" })),
            });
            await waitFor(() => expect(resolveNextPaperOf.has("second")).toBe(true));

            resolveNextPaperOf.get("second")!(nextOfSecond);
            const button = screen.getByRole("button", { name: "Next Paper" });
            await waitFor(() => expect(button).toBeEnabled());
            resolveNextPaperOf.get("first")!(nextOfFirst);
            // Let the late response settle before navigating.
            await new Promise((resolve) => setTimeout(resolve, 0));

            vi.mocked(goto).mockClear();
            await userEvent.click(button);

            await waitFor(() =>
                expect(goto).toHaveBeenCalledExactlyOnceWith(
                    expect.stringContaining(`/paper/${nextOfSecond.localId}`),
                ),
            );
        });
    });
});
