import { render, screen } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import FetcherOptionRow from "$lib/components/composites/settings/project-settings/slr/fetcher/FetcherOptionRow.svelte";
import userEvent from "@testing-library/user-event";

describe("FetcherOptionRow", () => {
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => vi.restoreAllMocks());

    test("When the component is shown, then it is rendered correctly", async () => {
        render(FetcherOptionRow, {
            target: document.body,
            props: {
                option: {
                    id: "NAME",
                    name: "Name",
                    description: "DESCRIPTION",
                    required: false,
                    isSecret: false,
                    value: "",
                },
                onValueChanged: () => {},
            },
        });

        expect(screen.getByText("Name", { exact: true })).toBeInTheDocument();
        expect(screen.getByPlaceholderText("DESCRIPTION")).toBeInTheDocument();
        expect(screen.getByTestId("NAME-set-default-btn")).toBeInTheDocument();
    });

    test("When you press the insert button, then the default value is inserted", async () => {
        let newValue = "";
        render(FetcherOptionRow, {
            target: document.body,
            props: {
                option: {
                    id: "NAME",
                    name: "Name",
                    description: "DESCRIPTION",
                    required: false,
                    isSecret: false,
                    value: "",
                    defaultValue: "DEFAULT_VALUE",
                },
                onValueChanged: (value: string) => (newValue = value),
            },
        });

        const inputBox = screen.getByPlaceholderText("DESCRIPTION") as HTMLInputElement;
        expect(inputBox.value).toEqual("");
        await userEvent.click(screen.getByTestId("NAME-set-default-btn"));
        expect(inputBox.value).toEqual("DEFAULT_VALUE");
        expect(newValue).toEqual("DEFAULT_VALUE");
    });
});
