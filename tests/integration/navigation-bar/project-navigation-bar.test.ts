import { assert, describe, expect, test } from "vitest";
import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
import { render, screen } from "@testing-library/svelte";
import { createProject, loading } from "../../model-builder";
import { mockUserContext, waitForComponentLoading } from "../test-helper";
import { ProjectStatus } from "$api/project";

describe("ProjectNavigationBar", () => {
    test("When all props are provided, then whole navigation bar is shown", async () => {
        render(ProjectNavigationBar, {
            target: document.body,
            props: {
                projectId: "123",
                loadingProject: loading(
                    createProject({
                        id: "123",
                        name: "Example Project Title",
                        status: ProjectStatus.ACTIVE,
                    }),
                ),
                defaultTabValue: "settings",
            },
            context: mockUserContext,
        });

        await waitForComponentLoading();

        const linkTags = screen.getAllByRole("tab");
        expect(linkTags).toHaveLength(3);

        const dashboardLinks = linkTags.filter(
            (link) => link.getAttribute("href") === "/project/123/dashboard",
        );
        expect(dashboardLinks).toHaveLength(1);
        const dashboardLink = dashboardLinks[0];
        expect(dashboardLink).toBeInTheDocument();
        expect(dashboardLink).toHaveTextContent("Dashboard");

        const papersLinks = linkTags.filter(
            (link) => link.getAttribute("href") === "/project/123/papers",
        );
        expect(papersLinks).toHaveLength(1);
        const paperLink = papersLinks[0];
        expect(paperLink).toBeInTheDocument();
        expect(paperLink).toHaveTextContent("Papers");

        // const statisticsLinks = linkTags.filter(
        //     (link) => link.getAttribute("href") === "/project/123/statistics",
        // );
        // expect(statisticsLinks).toHaveLength(1);
        // const statisticsLink = statisticsLinks[0];
        // expect(statisticsLink).toBeInTheDocument();
        // expect(statisticsLink).toHaveTextContent("Statistics");
        // expect(statisticsLink).toHaveAttribute("data-state", "active");
        // expect(statisticsLink).toHaveAttribute("aria-selected", "true");

        const settingsLinks = linkTags.filter(
            (link) => link.getAttribute("href") === "/project/123/settings/general",
        );
        expect(settingsLinks).toHaveLength(1);
        const settingsLink = settingsLinks[0];
        expect(settingsLink).toBeInTheDocument();
        expect(settingsLink).toHaveTextContent("Settings");

        // Project title is shown
        const projectTitle = screen.getByText("Example Project Title");
        expect(projectTitle).toBeInTheDocument();

        // Project ID and 'Archived' badge isn't shown
        assert.throws(() => screen.getByText("123"));
        assert.throws(() => screen.getByText("Archived"));
    });

    test("When the project is archived, then an additional 'Archived' badge is shown", async () => {
        render(ProjectNavigationBar, {
            target: document.body,
            props: {
                projectId: "123",
                loadingProject: loading(
                    createProject({
                        id: "123",
                        name: "Example Project Title",
                        status: ProjectStatus.ARCHIVED,
                    }),
                ),
                defaultTabValue: "settings",
            },
            context: mockUserContext,
        });

        await waitForComponentLoading();

        const archivedBadge = screen.getByText("Archived");
        expect(archivedBadge).toBeInTheDocument();
    });
});
