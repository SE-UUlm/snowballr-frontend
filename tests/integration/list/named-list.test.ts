import { expect, test, describe } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import NamedList from "$lib/components/composites/list/NamedList.svelte";
import { createRawSnippet } from "svelte";

const listItemSkeleton = createRawSnippet(() => {
    return { render: () => `<Skeleton class="h-5 w-20 rounded-full" data-testid="skeleton" />` };
});

const listItemComponent = createRawSnippet<[unknown]>((componentData) => {
    return { render: () => `<span data-testid="example-list-item">${componentData}</span>` };
});

describe("NamedListComponent", () => {
    test("When all required props are provided, then the named list is completely shown.", async () => {
        const componentData: Promise<string[]> = Promise.resolve(
            Array.from({ length: 15 }, (_, i) => `Hello world ${i}`),
        );

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent: listItemComponent,
                listItemSkeleton: listItemSkeleton,
                numberOfSkeletons: 10,
            },
        });

        // List title is shown
        expect(screen.getByText("Test List")).toBeInTheDocument();

        await waitFor(
            () => {
                // 15 list items are displayed
                expect(screen.queryAllByTestId("example-list-item").length).toBe(15);
            },
            { timeout: 250 },
        );
    });

    test("When the number of items should be shown, then the name of the list is extended by the number of list items.", async () => {
        const componentData: Promise<string[]> = Promise.resolve(
            Array.from({ length: 5 }, (_, i) => `Hello world ${i}`),
        );

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent: listItemComponent,
                listItemSkeleton: listItemSkeleton,
                numberOfSkeletons: 10,
                showNumberOfListItems: true,
            },
        });

        await waitFor(
            () => {
                // List title is shown
                expect(screen.getByText("Test List (5)")).toBeInTheDocument();
            },
            { timeout: 250 },
        );
    });

    test("When the number of items should be shown and is given explicitly, then the name of the list is extended by the given number of list items.", async () => {
        const componentData: Promise<string[]> = Promise.resolve(
            Array.from({ length: 5 }, (_, i) => `Hello world ${i}`),
        );

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent: listItemComponent,
                listItemSkeleton: listItemSkeleton,
                numberOfSkeletons: 10,
                showNumberOfListItems: true,
                numberOfItems: 10,
            },
        });

        await waitFor(
            () => {
                // List title is shown
                expect(screen.getByText("Test List (10)")).toBeInTheDocument();
            },
            { timeout: 250 },
        );
    });

    test("When the list is loading, then skeleton elements are shown", async () => {
        const componentData: Promise<string[]> = new Promise<string[]>((resolve) =>
            setTimeout(() => resolve(Array.from({ length: 5 }, (_, i) => `Hello world ${i}`)), 100),
        );

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent: listItemComponent,
                listItemSkeleton: listItemSkeleton,
                numberOfSkeletons: 5,
            },
        });

        expect(screen.queryAllByTestId("example-list-item").length).toBe(0);
        expect(screen.queryAllByTestId("skeleton").length).toBe(5);
    });

    test("When the list was loaded successfully, but no items exist, then a hint is shown (if provided)", async () => {
        const componentData: Promise<string[]> = Promise.resolve(
            Array.from({ length: 0 }, (_, i) => `Hello world ${i}`),
        );

        const { unmount } = render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent: listItemComponent,
                listItemSkeleton: listItemSkeleton,
                numberOfSkeletons: 10,
            },
        });

        // List title is shown
        expect(screen.getByText("Test List")).toBeInTheDocument();

        unmount();

        await waitFor(
            () => {
                // 0 list items are displayed
                expect(screen.queryAllByTestId("example-list-item").length).toBe(0);
            },
            { timeout: 250 },
        );

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent: listItemComponent,
                listItemSkeleton: listItemSkeleton,
                numberOfSkeletons: 10,
                emptyHint: "Test hint for empty list",
            },
        });

        // List title is shown
        expect(screen.getByText("Test List")).toBeInTheDocument();

        await waitFor(
            () => {
                // 0 list items are displayed
                expect(screen.queryAllByTestId("example-list-item").length).toBe(0);
                expect(screen.getByText("Test hint for empty list")).toBeInTheDocument();
            },
            { timeout: 250 },
        );
    });

    test("When the list item could not be loaded, then the error message is shown", async () => {
        const componentData: Promise<string[]> = new Promise<string[]>((_, reject) =>
            setTimeout(() => {
                return reject(new Error("Test Error"));
            }, 100),
        );

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent: listItemComponent,
                listItemSkeleton: listItemSkeleton,
                numberOfSkeletons: 10,
            },
        });

        await waitFor(
            () => {
                expect(screen.queryAllByTestId("example-list-item").length).toBe(0);
                expect(screen.queryAllByTestId("skeleton").length).toBe(0);

                expect(screen.getByText("Error: Test Error"));
            },
            { timeout: 250 },
        );
    });
});
