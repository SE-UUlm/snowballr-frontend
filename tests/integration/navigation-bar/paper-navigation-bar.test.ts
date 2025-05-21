import { expect, test, describe, assert } from "vitest";
import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";
import { render, screen } from "@testing-library/svelte";
import { loading, createPaper } from "../../model-builder";
import { mockUserContext, waitForComponentLoading } from "../test-helper";
import { Authors } from "../../example-data";

describe("PaperNavigationBar", () => {
    test("When all props are provided, then whole navigation bar is shown", async () => {
        render(PaperNavigationBar, {
            target: document.body,
            props: {
                backRef: "/",
                loadingPaper: loading(
                    createPaper({
                        title: "Example Paper Title",
                        authors: [Authors.johnDoe, Authors.janeSmith],
                    }),
                ),
                loadingPaperId: loading("123"),
            },
            context: mockUserContext,
        });

        await waitForComponentLoading();

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
        const paperAuthors = screen.getByText("John Doe, Jane Smith");
        expect(paperAuthors).toBeInTheDocument();

        // Paper ID is shown
        const paperId = screen.getByText("#123");
        expect(paperId).toBeInTheDocument();
    });

    test("When paper ID is not provided, then paper ID is not shown", async () => {
        render(PaperNavigationBar, {
            target: document.body,
            props: {
                backRef: "/",
                loadingPaper: loading(
                    createPaper({
                        title: "Example Paper Title",
                        authors: [Authors.johnDoe, Authors.janeSmith],
                    }),
                ),
            },
            context: mockUserContext,
        });

        await waitForComponentLoading();

        assert.throws(() => screen.getByText("#123"));
    });

    test("When paper authors are not provided, then 'unknown authors' is shown", async () => {
        render(PaperNavigationBar, {
            target: document.body,
            props: {
                backRef: "/",
                loadingPaper: loading(
                    createPaper({
                        title: "Example Paper Title",
                        authors: [],
                    }),
                ),
                loadingPaperId: loading("123"),
            },
            context: mockUserContext,
        });

        await waitForComponentLoading();

        const paperAuthors = screen.getByText("unknown authors");
        expect(paperAuthors).toBeInTheDocument();
    });
});
