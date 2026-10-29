import { render, screen, waitFor } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import FetcherOptionsDialog from "$lib/components/composites/settings/fetcher/FetcherOptionsDialog.svelte";
import userEvent from "@testing-library/user-event";
import type { FetcherInformation } from "$api/fetcher";
import type { Fetchers, SaveFetchers } from "$lib/components/composites/settings/fetcher/fetcher";

describe("FetcherOptionsDialog", () => {
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => vi.restoreAllMocks());

    const fetcher: FetcherInformation = {
        id: "test",
        name: "Test Fetcher",
        description: "This is a test fetcher",
        links: [],
        optionsSchema: {
            FOO: {
                name: "Foo",
                description: "This is the FOO option",
                required: false,
                isSecret: false,
            },
        },
    };

    test("When all props are provided, then it renders correctly", async () => {
        render(FetcherOptionsDialog, {
            target: document.body,
            props: {
                fetchers: {},
                onSave: async () => {},
                fetcher: fetcher,
                disabled: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
    });

    test("When the trigger is clicked, then the dialog is opened", async () => {
        const user = userEvent.setup();
        render(FetcherOptionsDialog, {
            target: document.body,
            props: {
                fetchers: {},
                onSave: async () => {},
                fetcher: fetcher,
                disabled: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        expect(screen.getByText("Edit Test Fetcher Fetcher Options")).toBeVisible();
        expect(screen.getByRole("button", { name: "Save Options" })).toBeVisible();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
    });

    test("When changes are disabled, then the dialog still can be opened, but changes are not allowed", async () => {
        const user = userEvent.setup();
        render(FetcherOptionsDialog, {
            target: document.body,
            props: {
                fetchers: {},
                onSave: async () => {},
                fetcher: fetcher,
                disabled: true,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        expect(screen.getByText("Edit Test Fetcher Fetcher Options")).toBeVisible();
        const saveButton = screen.getByRole("button", { name: "Save Options" });
        expect(saveButton).toBeVisible();
        expect(saveButton).toBeDisabled();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
        expect(screen.getByPlaceholderText("This is the FOO option")).toBeDisabled();
    });

    test("When you modify a fetcher, then the fetcher is saved with the updated options", async () => {
        const user = userEvent.setup();

        let savedFetchers: Fetchers | undefined;
        const onSave: SaveFetchers = vi.fn(async (fetchers, onSuccess) => {
            savedFetchers = fetchers;
            onSuccess();
        });

        render(FetcherOptionsDialog, {
            target: document.body,
            props: {
                fetchers: {},
                onSave,
                fetcher: fetcher,
                disabled: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        await userEvent.type(screen.getByPlaceholderText("This is the FOO option"), "TEST");
        await userEvent.click(screen.getByRole("button", { name: "Save Options" }));
        await waitFor(() => expect(savedFetchers).toBeDefined());

        expect(onSave).toHaveBeenCalledExactlyOnceWith(
            {
                test: {
                    options: {
                        FOO: "TEST",
                    },
                },
            },
            expect.any(Function),
            expect.any(Function),
        );
    });
});
