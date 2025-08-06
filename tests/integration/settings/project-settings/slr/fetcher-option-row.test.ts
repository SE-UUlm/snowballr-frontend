import { render, screen } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import FetcherOptionRow from "$lib/components/composites/settings/project-settings/slr/FetcherOptionRow.svelte";
import userEvent from "@testing-library/user-event";

describe("Fetcher Option Row", () => {
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => vi.restoreAllMocks());

    test("When you enter nothing, then the value is not overridden", async () => {
        render(FetcherOptionRow, {
            target: document.body,
            props: {
                name: "NAME",
                value: "",
                defaultValue: "DEFAULT_VALUE",
            },
        });

        const checkBox = screen.getByRole("checkbox");
        expect(checkBox).not.toBeChecked();
    });

    test("When you enter something, then the value is not overridden", async () => {
        render(FetcherOptionRow, {
            target: document.body,
            props: {
                name: "NAME",
                value: "test",
                defaultValue: "DEFAULT_VALUE",
            },
        });

        const checkBox = screen.getByRole("checkbox");
        expect(checkBox).toBeChecked();
    });

    test("When you press the insert button, then the default value is inserted", async () => {
        let newValue = "";
        render(FetcherOptionRow, {
            target: document.body,
            props: {
                name: "NAME",
                value: "",
                defaultValue: "DEFAULT_VALUE",
                onValueChanged: (value: string) => (newValue = value),
            },
        });

        const inputBox = screen.getByPlaceholderText("DEFAULT_VALUE") as HTMLInputElement;
        expect(inputBox.value).toEqual("");
        await userEvent.click(screen.getByRole("button"));
        expect(inputBox.value).toEqual("DEFAULT_VALUE");
        expect(newValue).toEqual("DEFAULT_VALUE");
    });
});
