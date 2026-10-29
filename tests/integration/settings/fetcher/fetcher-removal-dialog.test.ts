import { render, screen, waitFor } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import FetcherRemovalDialog from "$lib/components/composites/settings/fetcher/FetcherRemovalDialog.svelte";
import type { FetcherInformation } from "$api/fetcher";
import userEvent from "@testing-library/user-event";
import type { Fetchers, SaveFetchers } from "$lib/components/composites/settings/fetcher/fetcher";

describe("FetcherRemovalDialog", () => {
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => vi.restoreAllMocks());

    const fetcher: FetcherInformation = {
        id: "test",
        name: "Test Fetcher",
        description: "This is a test fetcher",
        links: [],
        optionsSchema: {},
    };

    test("When all props are provided, then it renders correctly", async () => {
        render(FetcherRemovalDialog, {
            target: document.body,
            props: {
                fetchers: { test: { options: {} } },
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

        render(FetcherRemovalDialog, {
            target: document.body,
            props: {
                fetchers: { test: { options: {} } },
                onSave: async () => {},
                fetcher: fetcher,
                disabled: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        expect(screen.getByRole("button", { name: "Remove Fetcher" })).toBeVisible();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
        expect(screen.getByText(fetcher.name, { exact: false })).toBeVisible();
    });

    test("When a fetcher is deleted, then it is removed from the saved fetchers", async () => {
        const user = userEvent.setup();

        let savedFetchers: Fetchers | undefined;
        const onSave: SaveFetchers = vi.fn(async (fetchers, onSuccess) => {
            savedFetchers = fetchers;
            onSuccess();
        });

        render(FetcherRemovalDialog, {
            target: document.body,
            props: {
                fetchers: { test: { options: {} } },
                onSave,
                fetcher: fetcher,
                disabled: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        screen.getByRole("button", { name: "Remove Fetcher" }).click();
        await waitFor(() => expect(savedFetchers).toBeDefined());

        expect(onSave).toHaveBeenCalledExactlyOnceWith(
            {},
            expect.any(Function),
            expect.any(Function),
        );
    });
});
