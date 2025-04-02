import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import UserSettingsLayout from "$lib/components/composites/settings/user-settings/UserSettingsLayout.svelte";
import TestUserSettingsLayout from "./TestUserSettingslayout.svelte";

describe("UserSettingsLayout", () => {
    it("When all props are provided, then component is displayed correctly", () => {
        render(UserSettingsLayout, {
            props: {
                selectedTab: "account",
            },
        });

        const tabs = screen.getAllByTestId("settings-tab-", { exact: false });
        expect(tabs).toHaveLength(4);

        // Check if tabs have correct content
        expect(tabs[0]).toHaveTextContent("Account");
        expect(tabs[1]).toHaveTextContent("Project Setup");
        expect(tabs[2]).toHaveTextContent("Shortcuts");
        expect(tabs[3]).toHaveTextContent("Review");
    });

    it("When tab is selected, then selected tab is highlighted", () => {
        render(UserSettingsLayout, {
            props: {
                selectedTab: "review",
            },
        });

        const accountTab = screen.getByTestId("settings-tab-account");
        const projectSetupTab = screen.getByTestId("settings-tab-projectsetup");
        const shortcutsTab = screen.getByTestId("settings-tab-shortcuts");
        const reviewTab = screen.getByTestId("settings-tab-review");

        expect(reviewTab).toHaveClass("bg-slate-200");
        expect(reviewTab).toHaveClass("rounded-lg");
        expect(accountTab).not.toHaveClass("bg-slate-200");
        expect(accountTab).not.toHaveClass("rounded-lg");
        expect(projectSetupTab).not.toHaveClass("bg-slate-200");
        expect(projectSetupTab).not.toHaveClass("rounded-lg");
        expect(shortcutsTab).not.toHaveClass("bg-slate-200");
        expect(shortcutsTab).not.toHaveClass("rounded-lg");
    });

    it("When children are passed, then children are displayed", () => {
        render(TestUserSettingsLayout);

        expect(screen.getByText("This is a test!")).toBeInTheDocument();
    });

    it("When layout is rendered, then tabs have links", () => {
        render(UserSettingsLayout, {
            props: {
                selectedTab: "account",
            },
        });

        const accountTab = screen.getByTestId("settings-tab-account");
        const projectSetupTab = screen.getByTestId("settings-tab-projectsetup");
        const shortcutsTab = screen.getByTestId("settings-tab-shortcuts");
        const reviewTab = screen.getByTestId("settings-tab-review");

        expect(accountTab).toHaveAttribute("href", `/settings/account`);
        expect(projectSetupTab).toHaveAttribute("href", `/settings/projectsetup`);
        expect(shortcutsTab).toHaveAttribute("href", `/settings/shortcuts`);
        expect(reviewTab).toHaveAttribute("href", `/settings/review`);
    });
});
