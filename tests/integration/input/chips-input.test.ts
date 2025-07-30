import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import ChipsInput from "$lib/components/composites/input/ChipsInput.svelte";
import type { ValidationResult } from "$lib/model/general";
import userEvent from "@testing-library/user-event";

function validateDemo(input: string): ValidationResult {
    if (input === "test fail") {
        return { success: false, error: "Please enter a correct input!" };
    }
    return { success: true };
}

const suggestions = ["world", "wild", "banana", "apple"];
function searchSuggestionsDemo(input: string): Promise<string[]> {
    return Promise.resolve(
        suggestions.filter((suggestion) => suggestion.includes(input.toLowerCase())),
    );
}

async function type(input: string): Promise<void> {
    await userEvent.type(screen.getByTestId("chips-input"), input);
}

describe("ChipsInput", () => {
    test("When all necessary props are provided, then the (empty) input is shown", () => {
        render(ChipsInput, {
            props: {
                items: [],
                validate: validateDemo,
            },
        });

        const inputElement = screen.queryByTestId("chips-input");
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toHaveAttribute("type", "text");
        expect(inputElement).not.toHaveAttribute("required");
    });

    test("When a label and label position are provided, then the label is shown based on the position", () => {
        const { unmount } = render(ChipsInput, {
            props: {
                items: [],
                validate: validateDemo,
                label: "Test Label",
            },
        });

        expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
        expect(screen.getByTestId("chips-input-container")).toHaveClass("flex-col");
        unmount();

        render(ChipsInput, {
            props: {
                items: [],
                validate: validateDemo,
                label: "Test Label",
                labelPosition: "left",
            },
        });

        expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
        expect(screen.getByTestId("chips-input-container")).toHaveClass("flex-row");
    });

    test("When a placeholder text is provided, then the input displays this placeholder", () => {
        render(ChipsInput, {
            props: {
                items: [],
                validate: validateDemo,
                placeholder: "Test Placeholder",
            },
        });

        const inputElement = screen.getByTestId("chips-input");
        expect(inputElement).toHaveAttribute("placeholder", "Test Placeholder");
    });

    test("When the user inputs a valid string, then the input is added and displayed as chip", async () => {
        render(ChipsInput, {
            props: {
                items: [],
                validate: validateDemo,
            },
        });

        await type("Hello");
        await type("{Tab}");

        expect(screen.getByTestId("chips-input")).toHaveFocus();

        expect(screen.getAllByTestId("chip-", { exact: false }).length).toBe(1);
        expect(screen.queryByText("Hello")).toBeInTheDocument();
        expect(screen.queryByText("World")).not.toBeInTheDocument();

        await type("World");
        await type("{Enter}");

        expect(screen.getAllByTestId("chip-", { exact: false }).length).toBe(2);
        expect(screen.queryByText("World")).toBeInTheDocument();
        expect(screen.queryByText("!")).not.toBeInTheDocument();

        await type("!");
        await type(",");

        expect(screen.getAllByTestId("chip-", { exact: false }).length).toBe(3);
        expect(screen.queryByText("!")).toBeInTheDocument();
        expect(screen.queryByText("?")).not.toBeInTheDocument();

        await type("?");
        await type("+");

        expect(screen.getAllByTestId("chip-", { exact: false }).length).toBe(4);
        expect(screen.queryByText("?")).toBeInTheDocument();
    });

    test("When the user inputs an invalid string, then the input is not added and an error message shown", async () => {
        render(ChipsInput, {
            props: {
                items: [],
                validate: validateDemo,
            },
        });

        await type("test fail");
        await type("{Enter}");

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        expect(screen.getByText("Please enter a correct input!")).toBeInTheDocument();
    });

    test("When the user deletes a chip, then it will be deleted from the displayed chips list and the items list", async () => {
        render(ChipsInput, {
            props: {
                items: ["Hello", "World", "!"],
                validate: validateDemo,
            },
        });

        await type("{Backspace}");

        expect(screen.getByTestId("chips-input")).toHaveFocus();
        expect(screen.getAllByTestId("chip-", { exact: false }).length).toBe(2);
        expect(screen.queryByText("Hello")).toBeInTheDocument();
        expect(screen.queryByText("World")).toBeInTheDocument();
        expect(screen.queryByText("!")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("chip-0").getElementsByTagName("button")[0]);
        expect(screen.getAllByTestId("chip-", { exact: false }).length).toBe(1);
        expect(screen.queryByText("Hello")).not.toBeInTheDocument();
        expect(screen.queryByText("World")).toBeInTheDocument();
    });

    test("When the user navigates using the left and right arrow keys, then either the chips are navigated or the current input, if it exists", async () => {
        render(ChipsInput, {
            props: {
                items: ["test"],
                validate: validateDemo,
            },
        });

        await type("test 2");

        await type("{ArrowRight}");
        await type("{ArrowRight}");
        expect(screen.getByTestId("chip-0")).not.toHaveClass("bg-slate-300");

        await type("{Enter}");
        await type("test 3");
        await type("{Enter}");

        await type("{ArrowLeft}");
        await type("{ArrowLeft}");
        expect(screen.getByTestId("chip-1")).toHaveClass("bg-slate-300");
        expect(screen.getByTestId("chip-2")).toHaveClass("bg-slate-200");

        await type("{ArrowRight}");
        expect(screen.getByTestId("chip-1")).toHaveClass("bg-slate-200");
        expect(screen.getByTestId("chip-2")).toHaveClass("bg-slate-300");
    });

    test("When a search function for suggestions is provided and the user inputs a valid string, then matching suggestions are shown", async () => {
        render(ChipsInput, {
            props: {
                items: ["Hello"],
                validate: validateDemo,
                searchSuggestions: searchSuggestionsDemo,
            },
        });

        expect(screen.queryByTestId("chips-suggestions")).not.toBeInTheDocument();

        await type("W");
        await waitFor(() => expect(screen.queryByTestId("chips-suggestions")).toBeInTheDocument());
        expect(screen.queryAllByTestId("suggestion-", { exact: false }).length).toBe(2);

        await type("o");
        await type("b");
        await waitFor(() =>
            expect(screen.queryByTestId("chips-suggestions")).not.toBeInTheDocument(),
        );
        expect(screen.queryAllByTestId("suggestion-", { exact: false }).length).toBe(0);
    });

    test("When a search function for suggestions is provided and the user navigates using the up and down arrow keys, then the suggestions are selected and can be autocompleted", async () => {
        render(ChipsInput, {
            props: {
                items: ["Hello"],
                validate: validateDemo,
                searchSuggestions: searchSuggestionsDemo,
            },
        });

        await type("W");
        await waitFor(() => expect(screen.queryByTestId("chips-suggestions")).toBeInTheDocument());
        await type("{ArrowDown}");
        expect(screen.queryByTestId("suggestion-0")).toHaveClass("bg-accent");
        expect(screen.queryByTestId("suggestion-1")).not.toHaveClass("bg-accent");

        await type("{ArrowDown}");
        expect(screen.queryByTestId("suggestion-0")).not.toHaveClass("bg-accent");
        expect(screen.queryByTestId("suggestion-1")).toHaveClass("bg-accent");

        await type("{ArrowUp}");
        expect(screen.queryByTestId("suggestion-0")).toHaveClass("bg-accent");
        expect(screen.queryByTestId("suggestion-1")).not.toHaveClass("bg-accent");

        await type("{Tab}");
        expect(screen.queryByTestId("chips-input")).toHaveFocus();
        expect(screen.queryAllByTestId("chip-", { exact: false }).length).toBe(2);
    });

    test("When a search function for suggestions is provided and the user clicks on a suggestion, then this suggestion is added", async () => {
        render(ChipsInput, {
            props: {
                items: ["Hello"],
                validate: validateDemo,
                searchSuggestions: searchSuggestionsDemo,
            },
        });

        await type("W");
        await waitFor(() => expect(screen.queryByTestId("chips-suggestions")).toBeInTheDocument());
        await userEvent.click(screen.getByTestId("suggestion-0"));
        expect(screen.queryByTestId("chips-input")).toHaveFocus();
        expect(screen.queryAllByTestId("chip-", { exact: false }).length).toBe(2);
    });

    test("When a function for resolving aliases is provided, then the inputs are resolved if possible", async () => {
        render(ChipsInput, {
            props: {
                items: ["Hello"],
                validate: validateDemo,
                resolveAlias: (input: string) => (input === "alias.world" ? "world" : input),
            },
        });

        await type("alias.world");
        await type("{Tab}");
        expect(screen.queryAllByTestId("chip-", { exact: false }).length).toBe(2);
        expect(screen.queryByText("alias.world")).not.toBeInTheDocument();
        expect(screen.queryByText("world")).toBeInTheDocument();

        await type("world");
        await type("{Tab}");
        expect(screen.queryAllByTestId("chip-", { exact: false }).length).toBe(2); // duplicate

        await type("!");
        await type("{Tab}");
        expect(screen.queryAllByTestId("chip-", { exact: false }).length).toBe(3); // duplicate
    });

    test("When a function for displaying alternative text for the items is provided, then this alternative text is shown instead of the items text", async () => {
        render(ChipsInput, {
            props: {
                items: [],
                validate: validateDemo,
                displayItem: (input: string) => "-" + input + "-",
            },
        });

        await type("Hello");
        await type("{Tab}");
        expect(screen.queryByText("Hello")).not.toBeInTheDocument();
        expect(screen.queryByText("-Hello-")).toBeInTheDocument();
    });
});
