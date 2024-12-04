import { expect, test, describe } from "vitest";
import PaperEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { createPaper, Users } from "../../model-builder";

describe("PaperListEntryComponent", () => {
    test("When all required props are provided, then the paper list entry is completely shown (without review information)", () => {
        render(PaperEntry, {
            props: {
                paper: createPaper({
                    title: "Test Title",
                    authors: [Users.johnDoe, Users.janeDoe],
                }),
                projectId: 42,
            },
        });

        expect(screen.getByText("#0")).toBeInTheDocument();
        expect(screen.getByText("Test Title")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Jane Doe")).toBeInTheDocument();

        // border does not indicate review status
        expect(screen.getByRole("button").children[0]).not.toHaveClass("border-l-4");
        // and no user avatar exist indicate the individual review decision
        expect(screen.getByRole("button").childElementCount).toBe(1);
    });

    test("When review information are provided, but should not be shown, then the paper list entry is completely shown without review information", () => {
        render(PaperEntry, {
            props: {
                paper: createPaper({
                    title: "Test Title",
                    authors: [Users.johnDoe, Users.janeDoe],
                }),
                projectId: 42,
                showReviewStatus: false,
            },
        });

        expect(screen.getByText("#0")).toBeInTheDocument();
        expect(screen.getByText("Test Title")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Jane Doe")).toBeInTheDocument();

        // border does not indicate review status
        expect(screen.getByRole("button").children[0]).not.toHaveClass("border-l-4");
        // and no user avatar exist indicate the individual review decision
        expect(screen.getByRole("button").childElementCount).toBe(1);
    });

    test("When review information are provided and should be shown, then the paper list entry is completely shown with review information", () => {
        render(PaperEntry, {
            props: {
                paper: createPaper({
                    title: "Test Title",
                    authors: [Users.johnDoe, Users.janeDoe],
                }),
                projectId: 42,
                showReviewStatus: true,
            },
        });

        expect(screen.getByText("#0")).toBeInTheDocument();
        expect(screen.getByText("Test Title")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Jane Doe")).toBeInTheDocument();

        expect(screen.getByRole("button").children[0]).toHaveClass("border-l-4 border-decline-red");
        expect(screen.getByRole("button").childElementCount).toBe(2);
    });

    test("When the user provides a custom onclick function, then it is executed on a single click (and not on double click)", async () => {
        let onClickExecuted: boolean = false;

        render(PaperEntry, {
            props: {
                paper: createPaper({
                    title: "Test Title",
                    authors: [Users.johnDoe, Users.janeDoe],
                }),
                projectId: 42,
                showReviewStatus: false,
                onClick: () => (onClickExecuted = true),
            },
        });

        await userEvent.dblClick(screen.getByRole("button"));
        expect(onClickExecuted).equal(false);

        await userEvent.click(screen.getByRole("button"));
        await new Promise((resolve) => setTimeout(resolve, 505));
        expect(onClickExecuted).equal(true);
    });
});
