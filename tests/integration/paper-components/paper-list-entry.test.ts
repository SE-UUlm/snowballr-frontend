import { expect, test, describe } from "vitest";
import PaperEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { waitForComponentLoading } from "../test-helper";
import { Papers, Reviews } from "../../example-data";
import { PaperDecision } from "$lib/model/api/project";

describe("PaperListEntryComponent", () => {
    test("When all required props are provided, then the paper list entry is completely shown (without review information)", async () => {
        render(PaperEntry, {
            props: {
                projectPaper: {
                    id: "0",
                    paper: Papers.demoPaper1,
                    stage: 0n,
                    decision: PaperDecision.UNDECIDED,
                    reviews: [],
                },
                projectId: "0",
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("#0")).toBeInTheDocument();
        expect(screen.getByText("An Analysis of TypeScript Performance")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Bob Johnson")).toBeInTheDocument();

        // border does not indicate review status
        expect(screen.getByRole("button").children[0]).not.toHaveClass("border-l-4");
        // and no user avatar exist indicate the individual review decision
        expect(screen.getByRole("button").childElementCount).toBe(1);
    });

    test("When review information are provided, but should not be shown, then the paper list entry is completely shown without review information", async () => {
        render(PaperEntry, {
            props: {
                projectPaper: {
                    id: "0",
                    paper: Papers.demoPaper1,
                    stage: 0n,
                    decision: PaperDecision.UNDECIDED,
                    reviews: [Reviews.demoReview1],
                },
                projectId: "0",
                showReviewStatus: false,
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("#0")).toBeInTheDocument();
        expect(screen.getByText("An Analysis of TypeScript Performance")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Bob Johnson")).toBeInTheDocument();

        // border does not indicate review status
        expect(screen.getByRole("button").children[0]).not.toHaveClass("border-l-4");
        // and no user avatar exist indicate the individual review decision
        expect(screen.getByRole("button").childElementCount).toBe(1);
    });

    test("When review information are provided and should be shown, then the paper list entry is completely shown with review information", async () => {
        render(PaperEntry, {
            props: {
                projectPaper: {
                    id: "0",
                    paper: Papers.demoPaper1,
                    stage: 0n,
                    decision: PaperDecision.DECLINED,
                    reviews: [Reviews.demoReview1],
                },
                projectId: "0",
                showReviewStatus: true,
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("#0")).toBeInTheDocument();
        expect(screen.getByText("An Analysis of TypeScript Performance")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Bob Johnson")).toBeInTheDocument();

        expect(screen.getByRole("button").children[0]).toHaveClass("border-l-4 border-decline-red");
        expect(screen.getByRole("button").childElementCount).toBe(1);
    });

    test("When the user provides a custom onclick function, then it is executed on a single click (and not on double click)", async () => {
        let onClickExecuted: boolean = false;

        render(PaperEntry, {
            props: {
                projectPaper: {
                    id: "0",
                    paper: Papers.demoPaper1,
                    stage: 0n,
                    decision: PaperDecision.UNDECIDED,
                    reviews: [Reviews.demoReview1],
                },
                projectId: "0",
                showReviewStatus: false,
                onClick: () => (onClickExecuted = true),
            },
        });

        await waitForComponentLoading();

        await userEvent.dblClick(screen.getByRole("button"));
        expect(onClickExecuted).equal(false);

        await userEvent.click(screen.getByRole("button"));
        await new Promise((resolve) => setTimeout(resolve, 350));
        expect(onClickExecuted).equal(true);
    });
});
