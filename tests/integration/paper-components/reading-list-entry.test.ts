import { describe, expect, test } from "vitest";
import ReadingListEntry from "$lib/components/composites/paper-components/ReadingListEntry.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { waitForComponentLoading } from "../test-helper";
import { Papers } from "../../example-data";

describe("ReadingListEntryComponent", () => {
    test("When all required props except an onClick handler are provided, then the reading list entry is completely shown", async () => {
        render(ReadingListEntry, {
            props: {
                paper: Papers.demoPaper1,
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("An Analysis of TypeScript Performance")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Bob Johnson")).toBeInTheDocument();
        expect(
            screen.getByText("An Analysis of TypeScript Performance").closest("a"),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Remove from reading list" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Download this paper" })).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Open Paper" })).not.toBeInTheDocument();
    });

    test("When all required props are provided, then the reading list entry is completely shown", async () => {
        render(ReadingListEntry, {
            props: {
                paper: Papers.demoPaper1,
                onClick: () => {},
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("An Analysis of TypeScript Performance")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Bob Johnson")).toBeInTheDocument();
        expect(
            screen.getByText("An Analysis of TypeScript Performance").closest("button"),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Remove from reading list" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Download this paper" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Open Paper" })).toBeInTheDocument();
    });

    test("When the user provides a custom onclick function, then it is executed on click", async () => {
        let onClickExecuted: boolean = false;

        render(ReadingListEntry, {
            props: {
                paper: Papers.demoPaper1,
                onClick: () => (onClickExecuted = true),
            },
        });

        await waitForComponentLoading();
        await userEvent.click(
            screen.getByRole("button", { name: "Paper info for reading list entry" }),
        );
        await new Promise((resolve) => setTimeout(resolve, 350));
        expect(onClickExecuted).equal(true);
    });

    test("When the user provides a custom onclick function, then the link button opens the paper", async () => {
        render(ReadingListEntry, {
            props: {
                paper: Papers.demoPaper1,
                onClick: () => {},
            },
        });

        await waitForComponentLoading();
        expect(screen.getByRole("link", { name: "Open Paper" })).toHaveAttribute(
            "href",
            "/paper/0",
        );
    });
});
