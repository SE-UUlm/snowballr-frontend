import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/svelte";
import NamedList from "$lib/components/composites/utils/NamedList.svelte";
// @ts-expect-error "Snippets have implicetly type any"
import { listItemComponent, listItemSkeleton } from "./ExampleSnippets.svelte";

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
            },
        });

        // List title is shown
        expect(screen.getByText("Test List")).toBeInTheDocument();

        setTimeout(() => {
            // 15 list items are displayed
            expect(screen.getAllByRole("span").length).toBe(15);

            // list has an overflow, as not all items can be displayed
            expect(
                screen.getByRole("list").scrollHeight > screen.getByRole("list").clientHeight,
            ).toBeTruthy();
        }, 250);
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
                showNumberOfListItems: true,
            },
        });

        setTimeout(() => {
            // List title is shown
            expect(screen.getByText("Test List (5)")).toBeInTheDocument();
        }, 250);
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
                showNumberOfListItems: true,
                numberOfItems: 10,
            },
        });

        setTimeout(() => {
            // List title is shown
            expect(screen.getByText("Test List (10)")).toBeInTheDocument();
        }, 250);
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
            },
        });

        expect(screen.queryAllByRole("span").length).toBe(0);
        expect(screen.queryAllByTestId("skeleton").length).toBe(10);
    });

    test("When the list item could not be loaded, then the error message is shown", async () => {
        const componentData: Promise<string[]> = new Promise<string[]>(() =>
            setTimeout(() => {
                throw new Error("Test Error");
            }, 100),
        );

        render(NamedList, {
            props: {
                listName: "Test List",
                items: componentData,
                listItemComponent: listItemComponent,
                listItemSkeleton: listItemSkeleton,
            },
        });

        setTimeout(() => {
            expect(screen.queryAllByRole("span").length).toBe(0);
            expect(screen.queryAllByTestId("skeleton").length).toBe(0);

            expect(screen.getByText("Test Error"));
        }, 250);
    });
});
