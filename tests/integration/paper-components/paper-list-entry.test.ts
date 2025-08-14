import { beforeEach, describe, expect, test } from "vitest";
import PaperEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { waitForComponentLoading } from "../test-helper";
import { Papers, Reviews } from "../../example-data";
import { PaperDecision } from "$lib/model/api/project";
import { reviewMode } from "$lib/global-state/review-mode-state.svelte";

describe("PaperListEntryComponent", () => {
    beforeEach(() => {
        reviewMode.isActivated = true;
    });

    test("When all required props except an onClick handler are provided, then the paper list entry is completely shown (without review information)", async () => {
        render(PaperEntry, {
            props: {
                paper: Papers.demoPaper1,
                projectId: undefined,
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("#0")).toBeInTheDocument();
        expect(screen.getByText("An Analysis of TypeScript Performance")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Bob Johnson")).toBeInTheDocument();

        // border does not indicate review status
        // It is a link, because no onClick handler was provided
        expect(screen.getByRole("link").children[0]).not.toHaveClass("border-l-4");
        // and no user avatar exist indicate the individual review decision
        expect(screen.getByRole("link").childElementCount).toBe(1);
        expect(screen.queryByRole("link", { name: "Open Paper" })).not.toBeInTheDocument();
    });

    test("When review information except an onClick handler are provided, but should not be shown, then the paper list entry is completely shown without review information", async () => {
        render(PaperEntry, {
            props: {
                paper: {
                    id: "0",
                    localId: "0",
                    paper: Papers.demoPaper1,
                    stage: 0n,
                    decision: PaperDecision.UNREVIEWED,
                    reviews: [Reviews.demoReview1],
                },
                projectId: "0",
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("#0")).toBeInTheDocument();
        expect(screen.getByText("An Analysis of TypeScript Performance")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Bob Johnson")).toBeInTheDocument();

        // border does not indicate review status
        // It is a link, because no onClick handler was provided
        expect(screen.getByRole("link").children[0]).not.toHaveClass("border-l-4");
        // and no user avatar exist indicate the individual review decision
        expect(screen.getByRole("link").childElementCount).toBe(1);
        expect(screen.queryByRole("link", { name: "Open Paper" })).not.toBeInTheDocument();
    });

    test("When all required props are provided, then the paper list entry is completely shown (without review information)", async () => {
        render(PaperEntry, {
            props: {
                paper: Papers.demoPaper1,
                projectId: undefined,
                onClick: () => {},
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("#0")).toBeInTheDocument();
        expect(screen.getByText("An Analysis of TypeScript Performance")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Bob Johnson")).toBeInTheDocument();

        // border does not indicate review status
        // It is a button, because an onClick handler was provided
        expect(screen.getByRole("button").children[0]).not.toHaveClass("border-l-4");
        // and no user avatar exist indicate the individual review decision
        expect(screen.getByRole("button").childElementCount).toBe(1);
        expect(screen.getByRole("link", { name: "Open Paper" })).toBeInTheDocument();
    });

    test("When review information are provided, but should not be shown, then the paper list entry is completely shown without review information", async () => {
        render(PaperEntry, {
            props: {
                paper: {
                    id: "0",
                    localId: "0",
                    paper: Papers.demoPaper1,
                    stage: 0n,
                    decision: PaperDecision.UNREVIEWED,
                    reviews: [Reviews.demoReview1],
                },
                projectId: "0",
                onClick: () => {},
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("#0")).toBeInTheDocument();
        expect(screen.getByText("An Analysis of TypeScript Performance")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Bob Johnson")).toBeInTheDocument();

        // border does not indicate review status
        // It is a button, because an onClick handler was provided
        expect(screen.getByRole("button").children[0]).not.toHaveClass("border-l-4");
        // and no user avatar exist indicate the individual review decision
        expect(screen.getByRole("button").childElementCount).toBe(1);
    });

    test("When review information are provided and should be shown, then the paper list entry is completely shown with review information", async () => {
        reviewMode.isActivated = false;

        render(PaperEntry, {
            props: {
                paper: {
                    id: "0",
                    localId: "0",
                    paper: Papers.demoPaper1,
                    stage: 0n,
                    decision: PaperDecision.DECLINED,
                    reviews: [Reviews.demoReview1],
                },
                projectId: "0",
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("#0")).toBeInTheDocument();
        expect(screen.getByText("An Analysis of TypeScript Performance")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Bob Johnson")).toBeInTheDocument();

        expect(screen.getByTestId("paper-list-entry").childElementCount).toBe(2);
        expect(screen.getByTestId("paper-list-entry").children[0]).toHaveClass(
            "border-l-4 border-decline-red",
        );
        expect(screen.getByTestId("paper-list-entry").children[1]).toHaveTextContent("JD");
    });

    test("When the user provides a custom onclick function, then it is executed on click", async () => {
        let onClickExecuted: boolean = false;

        render(PaperEntry, {
            props: {
                paper: Papers.demoPaper1,
                projectId: undefined,
                onClick: () => (onClickExecuted = true),
            },
        });

        await waitForComponentLoading();
        await userEvent.click(screen.getByRole("button"));
        await new Promise((resolve) => setTimeout(resolve, 350));
        expect(onClickExecuted).equal(true);
    });

    test("When the user provides a custom onclick function, then the link button opens the paper", async () => {
        render(PaperEntry, {
            props: {
                paper: Papers.demoPaper1,
                projectId: undefined,
                onClick: () => {}, // force link icon to be shown
            },
        });

        await waitForComponentLoading();
        expect(screen.getByRole("link", { name: "Open Paper" })).toHaveAttribute(
            "href",
            "/paper/0",
        );
    });
});
