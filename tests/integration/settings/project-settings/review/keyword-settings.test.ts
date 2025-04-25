import { beforeEach, describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/svelte";
import KeywordSettings from "$lib/components/composites/settings/project-settings/review/KeywordSettings.svelte";
import userEvent from "@testing-library/user-event";

describe("KeywordSettings", () => {
    const maximumAmountOfTags = 51;
    const maximumTagLength = 101;
    beforeEach(() => {
        localStorage.clear();
        render(KeywordSettings, {
            props: {
                projectId: "0",
            },
        });
    });

    test("It is rendered correctly", async () => {
        expect(screen.queryByText("Keywords")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Add keyword")).toBeInTheDocument();
    });

    test("When the input is valid, then a tag is created", async () => {
        const tagsInputField = screen.getByLabelText(
            "Define keywords that are highlighted in the abstract of a paper in the review mode.",
        );
        await userEvent.type(tagsInputField, "New Tag 1");
        await userEvent.keyboard("{Enter}");
        expect(screen.getByText("New Tag 1")).toBeInTheDocument();
    });

    test("When the tag name already exists, the name is too long or blank, then no tag is created", async () => {
        const tagsInputField = screen.getByLabelText(
            "Define keywords that are highlighted in the abstract of a paper in the review mode.",
        );
        await userEvent.type(tagsInputField, "New Tag 1");
        await userEvent.keyboard("{Enter}");
        expect(screen.getByText("New Tag 1")).toBeInTheDocument();

        await userEvent.type(tagsInputField, "New Tag 1");
        await userEvent.keyboard("{Enter}");
        expect(screen.getAllByText("New Tag 1").length).toBe(1);

        await userEvent.type(tagsInputField, " ");
        await userEvent.keyboard("{Enter}");
        expect(screen.queryByText(" ")).not.toBeInTheDocument();

        const tooLongString = "a".repeat(maximumTagLength);
        await userEvent.type(tagsInputField, tooLongString);
        await userEvent.keyboard("{Enter}");
        expect(screen.queryByText(tooLongString)).not.toBeInTheDocument();
    });

    test("When the tag remove button is clicked, then the according tag gets removed correctly", async () => {
        const tagsInputField = screen.getByLabelText(
            "Define keywords that are highlighted in the abstract of a paper in the review mode.",
        );
        await userEvent.type(tagsInputField, "Tag to remove");
        await userEvent.keyboard("{Enter}");
        const tagToRemove = screen.getByText("Tag to remove");
        expect(tagToRemove).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "×" })).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "×" }));
        expect(tagToRemove).not.toBeInTheDocument();
    });

    test("When the maximum amount of tags is reached, then no other tag is created", async () => {
        const tagsInputField = screen.getByLabelText(
            "Define keywords that are highlighted in the abstract of a paper in the review mode.",
        );
        for (let i = 0; i < maximumAmountOfTags; i++) {
            await userEvent.type(tagsInputField, `New Tag ${i}`);
            await userEvent.keyboard("{Enter}");
            expect(screen.getByText(`New Tag ${i}`)).toBeInTheDocument();
        }
        await userEvent.type(tagsInputField, `New Tag ${maximumAmountOfTags}`);
        await userEvent.keyboard("{Enter}");
        expect(screen.queryByText(`New Tag ${maximumAmountOfTags}`)).not.toBeInTheDocument();
    });
});
