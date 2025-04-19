import { expect, test, describe } from "vitest";
import ReadingListEntry from "$lib/components/composites/paper-components/ReadingListEntry.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { waitForComponentLoading } from "../test-helper";
import { Papers } from "../../example-data";

describe("ReadingListEntryComponent", () => {
    test("When all required props are provided, then the reading list entry is completely shown", async () => {
        render(ReadingListEntry, {
            props: {
                paper: Papers.demoPaper1,
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("An Analysis of TypeScript Performance")).toBeInTheDocument();
        expect(screen.getByText("John Doe, Bob Johnson")).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Remove from Reading List" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Download this paper" })).toBeInTheDocument();
    });

    test("When the user provides a custom onclick function, then it is executed on a single click (and not on double click)", async () => {
        let onClickExecuted: boolean = false;

        render(ReadingListEntry, {
            props: {
                paper: Papers.demoPaper1,
                onClick: () => (onClickExecuted = true),
            },
        });

        await waitForComponentLoading();

        await userEvent.dblClick(
            screen.getByRole("button", { name: "Paper info for reading list entry" }),
        );
        expect(onClickExecuted).equal(false);

        await userEvent.click(
            screen.getByRole("button", { name: "Paper info for reading list entry" }),
        );
        await new Promise((resolve) => setTimeout(resolve, 350));
        expect(onClickExecuted).equal(true);
    });
});
