import { expect, test, describe } from "vitest";
import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
import { render, screen } from "@testing-library/svelte";

describe("SimpleNavigationBar", () => {
    test("When all props are provided, then whole navigation bar is shown", () => {
        render(SimpleNavigationBar, {
            target: document.body,
            props: {
                user: {
                    firstName: "John",
                    lastName: "Doe",
                },
                backRef: "/",
                title: "Simple Navigation Bar",
                tabs: [
                    {
                        value: "first",
                        label: "First",
                        href: "/first",
                    },
                    {
                        value: "second",
                        label: "Second",
                        href: "/second",
                    },
                ],
                defaultTabValue: "first",
            },
        });

        const header = screen.getByRole("banner");
        expect(header).toBeInTheDocument();

        const nav = screen.getByRole("navigation");
        expect(nav).toBeInTheDocument();

        const linkTags = screen.getAllByRole("link");
        expect(linkTags).toHaveLength(3);

        const backButtons = linkTags.filter((link) => link.getAttribute("href") === "/");
        expect(backButtons).toHaveLength(1);
        const backButton = backButtons[0];
        expect(backButton).toBeInTheDocument();

        const firstLinks = linkTags.filter((link) => link.getAttribute("href") === "/first");
        expect(firstLinks).toHaveLength(1);
        const firstLink = firstLinks[0];
        expect(firstLink).toBeInTheDocument();
        expect(firstLink).toHaveTextContent("First");

        const secondLinks = linkTags.filter((link) => link.getAttribute("href") === "/second");
        expect(secondLinks).toHaveLength(1);
        const secondLink = secondLinks[0];
        expect(secondLink).toBeInTheDocument();
        expect(secondLink).toHaveTextContent("Second");

        // Buttons have tab role
        const tabs = screen.getAllByRole("tab");
        expect(tabs).toHaveLength(2);

        // First tab is selected
        const firstTabs = tabs.filter((tab) => tab.getAttribute("tabindex") == "0");
        expect(firstTabs).toHaveLength(1);
        const firstTab = firstTabs[0];
        expect(firstTab).toHaveAttribute("data-state", "active");
        expect(firstTab).toHaveAttribute("aria-selected", "true");

        // Second tab is not selected
        const secondTabs = tabs.filter((tab) => tab.getAttribute("tabindex") == "-1");
        expect(secondTabs).toHaveLength(1);
        const secondTab = secondTabs[0];
        expect(secondTab).toHaveAttribute("data-state", "inactive");
        expect(secondTab).toHaveAttribute("aria-selected", "false");

        // User initials are shown
        const userInitials = screen.getByText("JD");
        expect(userInitials).toBeInTheDocument();

        // Title is shown
        const title = screen.getByText("Simple Navigation Bar");
        expect(title).toBeInTheDocument();
    });
});
