import { assert, expect, test, describe } from "vitest";
import NavigationBar from "$lib/components/composites/navigation-bar/NavigationBar.svelte";
import { render, screen } from "@testing-library/svelte";

describe("NavigationBar", () => {
    test("When all props are provided, then whole navigation bar is shown", () => {
        render(NavigationBar, {
            target: document.body,
            props: {
                user: {
                    firstName: "John",
                    lastName: "Doe",
                },
                backRef: "/",
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

        // Drop Down Menu isn't shown by default
        assert.throws(() => screen.getByText("John Doe"));
        assert.throws(() => screen.getByText("Reading List"));
        assert.throws(() => screen.getByText("Archived Projects"));
        assert.throws(() => screen.getByText("Invitations"));
        assert.throws(() => screen.getByText("Sign out"));
    });

    test("When no backRef is provided, then no back button is shown", () => {
        render(NavigationBar, {
            target: document.body,
            props: {
                user: {
                    firstName: "John",
                    lastName: "Doe",
                },
                backRef: undefined,
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

        const linkTags = screen.getAllByRole("link");
        const backButtons = linkTags.filter((link) => link.getAttribute("href") === "/");
        expect(backButtons).toHaveLength(0);
    });

    test("When no tabs are provided, then no tabs are shown", () => {
        render(NavigationBar, {
            target: document.body,
            props: {
                user: {
                    firstName: "John",
                    lastName: "Doe",
                },
                backRef: "/",
                tabs: [],
                defaultTabValue: "first",
            },
        });

        assert.throws(() => screen.getAllByRole("tab"));
    });

    test("When default tab value doesn't match any tab, then no tab is selected", () => {
        render(NavigationBar, {
            target: document.body,
            props: {
                user: {
                    firstName: "John",
                    lastName: "Doe",
                },
                backRef: "/",
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
                defaultTabValue: "third",
            },
        });

        const tabs = screen.getAllByRole("tab");

        // First tab is not selected
        const firstTabs = tabs.filter((tab) => tab.getAttribute("tabindex") == "0");
        expect(firstTabs).toHaveLength(1);
        const firstTab = firstTabs[0];
        expect(firstTab).toHaveAttribute("data-state", "inactive");
        expect(firstTab).toHaveAttribute("aria-selected", "false");

        // Second tab is not selected
        const secondTabs = tabs.filter((tab) => tab.getAttribute("tabindex") == "-1");
        expect(secondTabs).toHaveLength(1);
        const secondTab = secondTabs[0];
        expect(secondTab).toHaveAttribute("data-state", "inactive");
        expect(secondTab).toHaveAttribute("aria-selected", "false");
    });

    test("When no name is provided, then no user initials are shown", () => {
        render(NavigationBar, {
            target: document.body,
            props: {
                user: {
                    firstName: "",
                    lastName: "",
                },
                backRef: "/",
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

        assert.throws(() => screen.getByText("JD"));
    });
});
