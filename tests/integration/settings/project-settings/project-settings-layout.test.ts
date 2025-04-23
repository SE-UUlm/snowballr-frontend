import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import TestProjectSettingsLayout from "./TestProjectSettingsLayout.svelte";

describe("ProjectSettingsLayout", () => {
    test("When all props are provided, then component is displayed correctly", () => {
        render(ProjectSettingsLayout, {
            target: document.body,
            props: {
                projectId: "1",
                selectedTab: "general",
            },
        });

        const tabs = screen.getAllByTestId("settings-tab-", { exact: false });
        expect(tabs).toHaveLength(4);

        // Check if tabs have correct content
        expect(tabs[0]).toHaveTextContent("General");
        expect(tabs[1]).toHaveTextContent("Members");
        expect(tabs[2]).toHaveTextContent("SLR");
        expect(tabs[3]).toHaveTextContent("Review");
    });

    test("When tab is selected, then selected tab is highlighted", () => {
        render(ProjectSettingsLayout, {
            target: document.body,
            props: {
                projectId: "1",
                selectedTab: "review",
            },
        });

        const generalTab = screen.getByTestId("settings-tab-general");
        const membersTab = screen.getByTestId("settings-tab-members");
        const slrTab = screen.getByTestId("settings-tab-slr");
        const reviewTab = screen.getByTestId("settings-tab-review");

        expect(reviewTab).toHaveClass("bg-slate-200");
        expect(reviewTab).toHaveClass("rounded-lg");
        expect(generalTab).not.toHaveClass("bg-slate-200");
        expect(generalTab).not.toHaveClass("rounded-lg");
        expect(membersTab).not.toHaveClass("bg-slate-200");
        expect(membersTab).not.toHaveClass("rounded-lg");
        expect(slrTab).not.toHaveClass("bg-slate-200");
        expect(slrTab).not.toHaveClass("rounded-lg");
    });

    test("When children are passed, then children are displayed", () => {
        render(TestProjectSettingsLayout);

        expect(screen.getByText("This is a test!")).toBeInTheDocument();
    });

    test("When layout is rendered, then tabs have links", () => {
        const projectId = "1";

        render(ProjectSettingsLayout, {
            target: document.body,
            props: {
                projectId,
                selectedTab: "general",
            },
        });

        const generalTab = screen.getByTestId("settings-tab-general");
        const membersTab = screen.getByTestId("settings-tab-members");
        const slrTab = screen.getByTestId("settings-tab-slr");
        const reviewTab = screen.getByTestId("settings-tab-review");

        expect(generalTab).toHaveAttribute("href", `/project/${projectId}/settings/general`);
        expect(membersTab).toHaveAttribute("href", `/project/${projectId}/settings/members`);
        expect(slrTab).toHaveAttribute("href", `/project/${projectId}/settings/slr`);
        expect(reviewTab).toHaveAttribute("href", `/project/${projectId}/settings/review`);
    });
});
