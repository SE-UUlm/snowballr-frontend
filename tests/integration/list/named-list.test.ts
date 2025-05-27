import { expect, test, describe, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";
import NamedList from "$lib/components/composites/list/NamedList.svelte";
import { createRawSnippet } from "svelte";
import { waitForComponentLoading } from "../test-helper";

const listItemSkeleton = createRawSnippet(() => {
    return { render: () => `<Skeleton class="h-5 w-20 rounded-full" data-testid="skeleton" />` };
});

const listItemComponent = createRawSnippet<[unknown]>((componentData) => {
    return { render: () => `<span data-testid="example-list-item">${componentData}</span>` };
});

let deterministicKey = 0;
const deterministicKeySelector = () => deterministicKey++;

describe("NamedListComponent", () => {
    beforeEach(() => {
        deterministicKey = 0;
    });

    test("When all required props are provided, then the named list is completely shown.", async () => {
        const componentData: Promise<string[]> = Promise.resolve(
            Array.from({ length: 15 }, (_, i) => `Hello world ${i}`),
        );

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent,
                listItemSkeleton,
                numberOfSkeletons: 10,
                keySelector: deterministicKeySelector,
            },
        });

        // List title is shown
        expect(screen.getByText("Test List")).toBeInTheDocument();

        await waitForComponentLoading();

        // 15 list items are displayed
        expect(screen.queryAllByTestId("example-list-item").length).toBe(15);
    });

    test("When the number of items should be shown, then the name of the list is extended by the number of list items.", async () => {
        const componentData: Promise<string[]> = Promise.resolve(
            Array.from({ length: 5 }, (_, i) => `Hello world ${i}`),
        );

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent,
                listItemSkeleton,
                numberOfSkeletons: 10,
                showNumberOfListItems: true,
                keySelector: deterministicKeySelector,
            },
        });

        await waitForComponentLoading();

        // List title is shown
        expect(screen.getByText("Test List (5)")).toBeInTheDocument();
    });

    test("When the number of items should be shown and is given explicitly, then the name of the list is extended by the given number of list items.", async () => {
        const componentData: Promise<string[]> = Promise.resolve(
            Array.from({ length: 5 }, (_, i) => `Hello world ${i}`),
        );

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent,
                listItemSkeleton,
                numberOfSkeletons: 10,
                showNumberOfListItems: true,
                numberOfItems: 10,
                keySelector: deterministicKeySelector,
            },
        });

        await waitForComponentLoading();

        // List title is shown
        expect(screen.getByText("Test List (10)")).toBeInTheDocument();
    });

    test("When the list is loading, then skeleton elements are shown", async () => {
        const componentData: Promise<string[]> = new Promise<string[]>((resolve) =>
            setTimeout(() => resolve(Array.from({ length: 5 }, (_, i) => `Hello world ${i}`)), 100),
        );

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent,
                listItemSkeleton,
                numberOfSkeletons: 5,
                keySelector: deterministicKeySelector,
            },
        });

        expect(screen.queryAllByTestId("example-list-item").length).toBe(0);
        expect(screen.queryAllByTestId("skeleton").length).toBe(5);
    });

    test("When the list items should be grouped, then a group header is displayed before each group (header defaults to 'Unknown').", async () => {
        type ComponentInterface = { name: string; group: string };

        const componentData: Promise<ComponentInterface[]> = Promise.resolve([
            { name: "Item A1", group: "groupA" },
            { name: "Item A2", group: "groupA" },
            { name: "Item B1", group: "groupB" },
            { name: "Item C1", group: "groupC" },
        ]);

        const groupLabels = Promise.resolve({
            groupA: "Group A",
            groupB: "Group B",
        });

        render(NamedList, {
            props: {
                listName: "Grouped List",
                items: componentData,
                listItemComponent,
                listItemSkeleton,
                numberOfSkeletons: 5,
                keySelector: deterministicKeySelector,
                groupSelector: (item) => (item as ComponentInterface).group,
                groupLabels,
            },
        });

        await waitForComponentLoading();

        const groupAHeader = screen.getByText("Group A");
        const groupBHeader = screen.getByText("Group B");
        const groupCHeader = screen.getByText("Unknown");

        // Ensure group headers are rendered
        expect(groupAHeader).toBeInTheDocument();
        expect(groupBHeader).toBeInTheDocument();
        // 'Item C1' has a group that is not known in the group labels, so the group header is "Unknown"
        expect(groupCHeader).toBeInTheDocument();
    });

    test("When the list was loaded successfully, but no items exist, then a hint is shown (if provided)", async () => {
        const componentData: Promise<string[]> = Promise.resolve(
            Array.from({ length: 0 }, (_, i) => `Hello world ${i}`),
        );

        const { unmount } = render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent,
                listItemSkeleton,
                numberOfSkeletons: 10,
                keySelector: deterministicKeySelector,
            },
        });

        // List title is shown
        expect(screen.getByText("Test List")).toBeInTheDocument();

        unmount();

        await waitForComponentLoading();

        // 0 list items are displayed
        expect(screen.queryAllByTestId("example-list-item").length).toBe(0);

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent,
                listItemSkeleton,
                numberOfSkeletons: 10,
                emptyHint: "Test hint for empty list",
                keySelector: deterministicKeySelector,
            },
        });

        // List title is shown
        expect(screen.getByText("Test List")).toBeInTheDocument();

        await waitForComponentLoading();

        // 0 list items are displayed
        expect(screen.queryAllByTestId("example-list-item").length).toBe(0);
        expect(screen.getByText("Test hint for empty list")).toBeInTheDocument();
    });

    test("When the list item couldn't be loaded, then the error message is shown", async () => {
        const componentData: Promise<string[]> = new Promise<string[]>((_, reject) =>
            setTimeout(() => {
                return reject(new Error("Test Error"));
            }, 100),
        );

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent,
                listItemSkeleton,
                numberOfSkeletons: 10,
                keySelector: deterministicKeySelector,
            },
        });

        await waitForComponentLoading();

        expect(screen.queryAllByTestId("example-list-item").length).toBe(0);
        expect(screen.queryAllByTestId("skeleton").length).toBe(0);

        expect(screen.getByText("Error: Test Error"));
    });
});
