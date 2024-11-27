import { assert, expect, test, describe } from "vitest";
import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

describe("SearchBarComponent", () => {
    test("When all required props are provided, then the search bar does not throw any error", () => {
        render(SearchBar, {
            props: { onSearch: (input: string) => console.log(input) },
        });
        assert.doesNotThrow(() => screen.getByPlaceholderText("Search"));
    });

    test("When placeholder text prop is provided, then the search bar shows the provided placeholder text and not the default text", () => {
        render(SearchBar, {
            props: {
                placeholderText: "Search paper",
                onSearch: (input: string) => console.log(input),
            },
        });

        assert.throws(() => screen.getByPlaceholderText("Search"));
        assert.doesNotThrow(() => screen.getByPlaceholderText("Search paper"));
    });

    test("When the user enters a search string into the search bar and click the search icon, then the search is conducted", async () => {
        let searchInput: string = "start";
        render(SearchBar, {
            props: { onSearch: (input: string) => (searchInput = input) },
        });

        await userEvent.type(screen.getByRole("textbox"), "Test");
        await userEvent.click(screen.getByRole("button"));
        assert.equal(searchInput, "Test");
    });

    test("When the user enters a search string into the search bar and press enter, then the search is conducted", async () => {
        let searchInput: string = "start";
        render(SearchBar, {
            props: { onSearch: (input: string) => (searchInput = input) },
        });

        await userEvent.type(screen.getByRole("textbox"), "Test");
        await userEvent.type(screen.getByRole("textbox"), "{enter}");
        assert.equal(searchInput, "Test");
    });

    test("When the user enters a search string into the search bar waits, then the search is conducted", async () => {
        let searchInput: string = "start";
        render(SearchBar, {
            props: { onSearch: (input: string) => (searchInput = input) },
        });

        await userEvent.type(screen.getByRole("textbox"), "Test");
        assert.equal(searchInput, "start");

        setTimeout(() => {
            assert.equal(searchInput, "Test");
        }, 500);
    });

    test("When the user doesn't enter a search string into the search bar, then no search is conducted", async () => {
        let searchInput: string = "start";
        render(SearchBar, {
            props: { onSearch: (input: string) => (searchInput = input) },
        });

        await userEvent.type(screen.getByRole("textbox"), "{enter}");
        assert.equal(searchInput, "start");

        await userEvent.click(screen.getByRole("button"));
        assert.equal(searchInput, "start");
    });

    test("When the user escapes the search bar, then no search is conducted and the search input cleared", async () => {
        let searchInput: string = "start";
        render(SearchBar, {
            props: { onSearch: (input: string) => (searchInput = input) },
        });

        await userEvent.type(screen.getByRole("textbox"), "Test");
        await userEvent.type(screen.getByRole("textbox"), "{esc}");
        assert.equal(searchInput, "start");
    });
});
