import { Paper_List } from "$lib/model/api/paper";
import { Project_Paper } from "$lib/model/api/project";
import AddPaperDialogButton from "$lib/components/composites/project-components/AddPaperDialogButton.svelte";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { render, screen } from "@testing-library/svelte";
import { expect, test, describe, beforeEach, afterEach, vi, assert } from "vitest";
import { mockUserContext } from "../test-helper";
import userEvent from "@testing-library/user-event";
import { createProject, loading } from "$tests/model-builder";

describe("AddPaperDialogButton", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        mockApiCall("searchLocalProjectPaperCandidates", Paper_List.create());
        mockApiCall("searchFetcherProjectPaperCandidates", Paper_List.create());
        mockApiCall("addPaperToProject", Project_Paper.create());
    });

    afterEach(async () => {
        vi.restoreAllMocks();
    });

    async function search(query: string) {
        const searchBox = screen.getByPlaceholderText("Search Query");
        await user.type(searchBox, query);
        await user.type(searchBox, "{enter}");
    }

    async function selectPaper(index: number) {
        const all = screen.getAllByTestId("add-paper-to-selected");
        assert(index < all.length);
        await user.click(all[index]);
    }

    async function unselectPaper(index: number) {
        const all = screen.getAllByTestId("remove-paper-from-selected");
        assert(index < all.length);
        await user.click(all[index]);
    }

    test("When local papers could not be fetched, then an error is displayed", async () => {
        mockFailedApiCall("searchLocalProjectPaperCandidates", "foobar");

        render(AddPaperDialogButton, {
            target: document.body,
            context: mockUserContext,
            props: {
                open: true,
                projectId: "1",
                stage: 1n,
                includeLocal: true,
                includeFetchers: false,
                loadingProject: loading(createProject()),
            },
        });

        await search("test");

        expect(await screen.findByText("foobar", { exact: false })).toBeVisible();
        expect(
            await screen.findByText("Error when searching for local papers", { exact: false }),
        ).toBeVisible();
    });

    test("When fetcher papers could not be fetched, then an error is displayed", async () => {
        mockFailedApiCall("searchFetcherProjectPaperCandidates", "foobar");

        render(AddPaperDialogButton, {
            target: document.body,
            context: mockUserContext,
            props: {
                open: true,
                projectId: "1",
                stage: 1n,
                includeLocal: false,
                includeFetchers: true,
                loadingProject: loading(createProject()),
            },
        });

        await search("test");

        expect(await screen.findByText("foobar", { exact: false })).toBeVisible();
        expect(
            await screen.findByText("Error when searching for fetcher papers", { exact: false }),
        ).toBeVisible();
    });

    test("When local papers are successfully fetched, then they are displayed", async () => {
        mockApiCall(
            "searchLocalProjectPaperCandidates",
            Paper_List.create({
                papers: [
                    {
                        title: "Foo",
                        authors: [{ firstName: "Alice", lastName: "Smith" }],
                        year: 2025,
                        publicationName: "Journal of Testing",
                    },
                ],
            }),
        );

        render(AddPaperDialogButton, {
            target: document.body,
            context: mockUserContext,
            props: {
                open: true,
                projectId: "1",
                stage: 1n,
                includeLocal: true,
                includeFetchers: false,
                loadingProject: loading(createProject()),
            },
        });

        await search("test");

        expect(await screen.findByText("Foo", { exact: false })).toBeVisible();
        expect(await screen.findByText("Alice Smith", { exact: false })).toBeVisible();
        expect(await screen.findByText("Journal of Testing", { exact: false })).toBeVisible();
        expect(await screen.findByText("2025", { exact: false })).toBeVisible();
        expect(screen.getAllByTestId("paper-available-to-be-added").length).toBe(1);
    });

    test("When fetcher papers are successfully fetched, then they are displayed", async () => {
        mockApiCall(
            "searchFetcherProjectPaperCandidates",
            Paper_List.create({
                papers: [
                    {
                        title: "Foo",
                        authors: [{ firstName: "Alice", lastName: "Smith" }],
                        year: 2025,
                        publicationName: "Journal of Testing",
                    },
                ],
            }),
        );

        render(AddPaperDialogButton, {
            target: document.body,
            context: mockUserContext,
            props: {
                open: true,
                projectId: "1",
                stage: 1n,
                includeLocal: false,
                includeFetchers: true,
                loadingProject: loading(createProject()),
            },
        });

        await search("test");

        expect(await screen.findByText("Foo", { exact: false })).toBeVisible();
        expect(await screen.findByText("Alice Smith", { exact: false })).toBeVisible();
        expect(await screen.findByText("Journal of Testing", { exact: false })).toBeVisible();
        expect(await screen.findByText("2025", { exact: false })).toBeVisible();
    });

    test("When local and fetcher papers are successfully fetched, then they are displayed", async () => {
        mockApiCall(
            "searchLocalProjectPaperCandidates",
            Paper_List.create({ papers: [{ id: "1", title: "Foo" }] }),
        );
        mockApiCall(
            "searchFetcherProjectPaperCandidates",
            Paper_List.create({ papers: [{ id: "2", title: "Bar" }] }),
        );

        render(AddPaperDialogButton, {
            target: document.body,
            context: mockUserContext,
            props: {
                open: true,
                projectId: "1",
                stage: 1n,
                includeLocal: true,
                includeFetchers: true,
                loadingProject: loading(createProject()),
            },
        });

        await search("test");

        expect(await screen.findByText("Foo", { exact: false })).toBeVisible();
        expect(await screen.findByText("Bar", { exact: false })).toBeVisible();
    });

    test("When local and fetcher papers return a paper with the same id, then only the local one is shown", async () => {
        mockApiCall(
            "searchLocalProjectPaperCandidates",
            Paper_List.create({ papers: [{ id: "1", title: "Foo" }] }),
        );
        mockApiCall(
            "searchFetcherProjectPaperCandidates",
            Paper_List.create({ papers: [{ id: "1", title: "Bar" }] }),
        );

        render(AddPaperDialogButton, {
            target: document.body,
            context: mockUserContext,
            props: {
                open: true,
                projectId: "1",
                stage: 1n,
                includeLocal: true,
                includeFetchers: true,
                loadingProject: loading(createProject()),
            },
        });

        await search("test");

        expect(await screen.findByText("Foo", { exact: false })).toBeVisible();
        expect(screen.queryByText("Bar", { exact: false })).not.toBeInTheDocument();
    });

    test("When a paper with undefined authors is encountered, then 'Unknown Authors' is displayed", async () => {
        mockApiCall(
            "searchLocalProjectPaperCandidates",
            Paper_List.create({ papers: [{ title: "Foo", authors: undefined }] }),
        );

        render(AddPaperDialogButton, {
            target: document.body,
            context: mockUserContext,
            props: {
                open: true,
                projectId: "1",
                stage: 1n,
                includeLocal: true,
                includeFetchers: false,
                loadingProject: loading(createProject()),
            },
        });

        await search("test");

        expect(await screen.findByText("Foo", { exact: false })).toBeVisible();
        expect(await screen.findByText("Unknown Authors", { exact: false })).toBeVisible();
    });

    test("When a paper is selected, then it moves to the selected list", async () => {
        mockApiCall(
            "searchLocalProjectPaperCandidates",
            Paper_List.create({ papers: [{ title: "Foo" }] }),
        );

        render(AddPaperDialogButton, {
            target: document.body,
            context: mockUserContext,
            props: {
                open: true,
                projectId: "1",
                stage: 1n,
                includeLocal: true,
                includeFetchers: false,
                loadingProject: loading(createProject()),
            },
        });

        await search("test");

        expect(await screen.findByText("Foo", { exact: false })).toBeVisible();
        expect(screen.getAllByTestId("paper-available-to-be-added").length).toBe(1);
        expect(screen.queryByTestId("paper-to-be-added")).not.toBeInTheDocument();
        await selectPaper(0);
        expect(screen.queryByTestId("paper-available-to-be-added")).not.toBeInTheDocument();
        expect(screen.getAllByTestId("paper-to-be-added").length).toBe(1);
        expect(await screen.findByText("Foo", { exact: false })).toBeVisible();
    });

    test("When a paper is deselected, then it is removed", async () => {
        mockApiCall(
            "searchLocalProjectPaperCandidates",
            Paper_List.create({ papers: [{ title: "Foo" }] }),
        );

        render(AddPaperDialogButton, {
            target: document.body,
            context: mockUserContext,
            props: {
                open: true,
                projectId: "1",
                stage: 1n,
                includeLocal: true,
                includeFetchers: false,
                loadingProject: loading(createProject()),
            },
        });

        await search("test");
        await selectPaper(0);
        mockApiCall("searchLocalProjectPaperCandidates", Paper_List.create({ papers: [] }));
        await search("test");

        expect(await screen.findByText("Foo", { exact: false })).toBeVisible();
        expect(screen.queryByTestId("paper-available-to-be-added")).not.toBeInTheDocument();
        expect(screen.getAllByTestId("paper-to-be-added").length).toBe(1);
        await unselectPaper(0);
        expect(screen.queryByTestId("paper-available-to-be-added")).not.toBeInTheDocument();
        expect(screen.queryByTestId("paper-to-be-added")).not.toBeInTheDocument();
        expect(screen.queryByText("Foo", { exact: false })).not.toBeInTheDocument();
    });
});
