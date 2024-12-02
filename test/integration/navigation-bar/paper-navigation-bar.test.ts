import { expect, test, describe, assert } from "vitest";
import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";
import { render, screen } from "@testing-library/svelte";

describe("PaperNavigationBar", () => {
    test("When all props are provided, then whole navigation bar is shown", async () => {
        render(PaperNavigationBar, {
            target: document.body,
            props: {
                user: {
                    firstName: "John",
                    lastName: "Doe",
                },
                backRef: "/",
                paper: {
                    id: 123,
                    title: "Example Paper Title",
                    authors: ["John Doe", "Jane Doe"],
                },
            },
        });

        const header = screen.getByRole("banner");
        expect(header).toBeInTheDocument();

        const nav = screen.getByRole("navigation");
        expect(nav).toBeInTheDocument();

        const linkTags = screen.getAllByRole("link");
        expect(linkTags).toHaveLength(1);

        const backButtons = linkTags.filter((link) => link.getAttribute("href") === "/");
        expect(backButtons).toHaveLength(1);
        const backButton = backButtons[0];
        expect(backButton).toBeInTheDocument();

        // User initials are shown
        const userInitials = screen.getByText("JD");
        expect(userInitials).toBeInTheDocument();

        // Paper title is shown
        const paperTitle = screen.getByText("Example Paper Title");
        expect(paperTitle).toBeInTheDocument();

        // Paper authors are shown
        const paperAuthors = screen.getByText("John Doe, Jane Doe");
        expect(paperAuthors).toBeInTheDocument();

        // Paper ID is shown
        const paperId = screen.getByText("#123");
        expect(paperId).toBeInTheDocument();
    });

    test("When paper ID is not provided, then paper ID is not shown", async () => {
        render(PaperNavigationBar, {
            target: document.body,
            props: {
                user: {
                    firstName: "John",
                    lastName: "Doe",
                },
                backRef: "/",
                paper: {
                    title: "Example Paper Title",
                    authors: ["John Doe", "Jane Doe"],
                },
            },
        });

        assert.throws(() => screen.getByText("#123"));
    });

    test("When paper authors are not provided, then 'unknown authors' is shown", async () => {
        render(PaperNavigationBar, {
            target: document.body,
            props: {
                user: {
                    firstName: "John",
                    lastName: "Doe",
                },
                backRef: "/",
                paper: {
                    id: 123,
                    title: "Example Paper Title",
                    authors: [],
                },
            },
        });

        const paperAuthors = screen.getByText("unknown authors");
        expect(paperAuthors).toBeInTheDocument();
    });
});
