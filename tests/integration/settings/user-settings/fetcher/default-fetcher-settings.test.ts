import { render, screen, waitFor } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import DefaultFetcherSettings from "$lib/components/composites/settings/user-settings/fetcher/DefaultFetcherSettings.svelte";
import { createUserSettings } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import userEvent from "@testing-library/user-event";
import { Project_Settings } from "$api/project";
import { UserSettings } from "$api/user_settings";
import type { FetcherInformation } from "$api/fetcher";

describe("DefaultFetcherSettings", () => {
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => vi.restoreAllMocks());

    const fetcher: FetcherInformation = {
        id: "test",
        name: "Test Fetcher",
        description: "This is a test fetcher",
        links: [],
        optionsSchema: {},
    };

    test("When the user has no default fetchers configured, then all available fetchers are listed as unused", async () => {
        mockApiCall("getAvailableFetchers", { fetchers: [fetcher] });
        mockApiCall("getUserSettings", createUserSettings());

        render(DefaultFetcherSettings, { target: document.body });

        await waitFor(() => expect(screen.getByText(fetcher.name)).toBeInTheDocument());
        expect(screen.getByTestId("settings-section-default-fetcher-settings")).toBeInTheDocument();
    });

    test("When the user already uses a fetcher by default, then it is listed as used", async () => {
        mockApiCall("getAvailableFetchers", { fetchers: [fetcher] });
        mockApiCall(
            "getUserSettings",
            createUserSettings({
                defaultProjectSettings: Project_Settings.create({
                    fetchers: { test: { options: {} } },
                }),
            }),
        );

        render(DefaultFetcherSettings, { target: document.body });

        await waitFor(() => expect(screen.getByText(fetcher.name)).toBeInTheDocument());
        const fetcherRow = screen
            .getByTestId("settings-section-default-fetcher-settings")
            .querySelector("li");
        expect(fetcherRow?.querySelectorAll("button")).toHaveLength(2);
    });

    test("When the user adds a default fetcher, then it is persisted to their user settings", async () => {
        const user = userEvent.setup();

        mockApiCall("getAvailableFetchers", { fetchers: [fetcher] });
        mockApiCall("getUserSettings", createUserSettings());
        const mockUpdateCall = mockApiCall(
            "updateUserSettings",
            UserSettings.create({
                defaultProjectSettings: Project_Settings.create({
                    fetchers: { test: { options: {} } },
                }),
            }),
        );

        render(DefaultFetcherSettings, { target: document.body });

        await waitFor(() => expect(screen.getByText(fetcher.name)).toBeInTheDocument());
        await user.click(screen.getByTestId("alert-dialog-trigger"));
        await user.click(screen.getByTestId("alert-dialog-action"));

        await waitFor(() =>
            expect(mockUpdateCall).toHaveBeenCalledExactlyOnceWith({
                mask: {
                    paths: ["user_settings.default_project_settings.fetchers"],
                },
                userSettings: UserSettings.create({
                    defaultProjectSettings: Project_Settings.create({
                        fetchers: { test: { options: {} } },
                    }),
                }),
            }),
        );
    });

    test("When loading the default fetchers fails, then an error is shown", async () => {
        mockFailedApiCall("getUserSettings", "boom");

        render(DefaultFetcherSettings, { target: document.body });

        await waitFor(() =>
            expect(
                screen.getByText("Failed to Load your Default Fetcher Settings"),
            ).toBeInTheDocument(),
        );
    });
});
