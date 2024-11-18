import { assert, expect, test, describe } from "vitest";
import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
import { render, screen } from "@testing-library/svelte";

describe("ProjectNavigationBar", () => {
    test("When all props are provided, then whole navigation bar is shown", async () => {
        render(ProjectNavigationBar, {
            target: document.body,
            props: {
                user: {
                    firstName: "John",
                    lastName: "Doe",
                },
                project: {
                    id: 123,
                    name: "Example Project Title",
                },
                defaultTabValue: "statistics",
            },
        });

        const linkTags = screen.getAllByRole("link");
        expect(linkTags).toHaveLength(5);

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

        const statisticsLinks = linkTags.filter(
            (link) => link.getAttribute("href") === "/project/123/statistics",
        );
        expect(statisticsLinks).toHaveLength(1);
        const statisticsLink = statisticsLinks[0];
        expect(statisticsLink).toBeInTheDocument();
        expect(statisticsLink).toHaveTextContent("Statistics");

        const settingsLinks = linkTags.filter(
            (link) => link.getAttribute("href") === "/project/123/settings/general",
        );
        expect(settingsLinks).toHaveLength(1);
        const settingsLink = settingsLinks[0];
        expect(settingsLink).toBeInTheDocument();
        expect(settingsLink).toHaveTextContent("Settings");

        // Buttons have tab role
        const tabs = screen.getAllByRole("tab");
        expect(tabs).toHaveLength(4);

        // Statistics tab is selected
        const statisticsTabs = tabs.filter((tab) => tab.textContent === "Statistics");
        expect(statisticsTabs).toHaveLength(1);
        const statisticsTab = statisticsTabs[0];
        expect(statisticsTab).toHaveAttribute("data-state", "active");
        expect(statisticsTab).toHaveAttribute("aria-selected", "true");

        // Project title is shown
        const projectTitle = screen.getByText("Example Project Title");
        expect(projectTitle).toBeInTheDocument();

        // Project ID isn't shown
        assert.throws(() => screen.getByText("123"));
    });
});
