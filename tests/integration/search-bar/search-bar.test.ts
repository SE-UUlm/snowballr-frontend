import { expect, test, describe } from "vitest";
import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

describe("SearchBarComponent", () => {
    test("When all required props are provided, then the search bar exists without any error", () => {
        render(SearchBar, {
            props: { onSearch: (input: string) => console.log(input) },
        });
        expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    });

    test("When placeholder text prop is provided, then the search bar shows the provided placeholder text and not the default text", () => {
        render(SearchBar, {
            props: {
                placeholderText: "Search paper",
                onSearch: (input: string) => console.log(input),
            },
        });

        expect(() => screen.getByPlaceholderText("Search")).toThrowError();
        expect(screen.getByPlaceholderText("Search paper")).toBeInTheDocument();
    });

    test("When the user enters a search string into the search bar and clicks the search icon, then the search is conducted", async () => {
        let searchInput: string = "start";
        render(SearchBar, {
            props: { onSearch: (input: string) => (searchInput = input) },
        });

        await userEvent.type(screen.getByRole("textbox"), "Test");
        expect(searchInput).not.equal("Test");
        await userEvent.click(screen.getByRole("button"));
        expect(searchInput).equal("Test");
    });

    test("When the user enters a search string into the search bar and presses enter, then the search is conducted", async () => {
        let searchInput: string = "start";
        render(SearchBar, {
            props: { onSearch: (input: string) => (searchInput = input) },
        });

        await userEvent.type(screen.getByRole("textbox"), "Test");
        expect(searchInput).not.equal("Test");
        await userEvent.type(screen.getByRole("textbox"), "{enter}");
        expect(searchInput).equal("Test");
    });

    test("When the user enters a search string into the search bar and waits, then the search is conducted", async () => {
        let searchInput: string = "start";
        render(SearchBar, {
            props: { onSearch: (input: string) => (searchInput = input) },
        });

        await userEvent.type(screen.getByRole("textbox"), "Test");
        expect(searchInput).equal("start");

        await new Promise((resolve) => setTimeout(resolve, 550));
        expect(searchInput).equal("Test");
    });

    test("When the user doesn't enter a search string into the search bar, then 'no search' is conducted but only the onSearch method is called with an empy string", async () => {
        let searchInput: string = "start";
        render(SearchBar, {
            props: { onSearch: (input: string) => (searchInput = input) },
        });

        await userEvent.type(screen.getByRole("textbox"), "{enter}");
        expect(searchInput).equal("");

        await userEvent.click(screen.getByRole("button"));
        expect(searchInput).equal("");
    });

    test("When the user escapes the search bar, then no search is conducted and the search input cleared", async () => {
        let searchInput: string = "start";
        render(SearchBar, {
            props: {
                onSearch: (input: string) => (searchInput = input),
            },
        });

        await userEvent.type(screen.getByRole("textbox"), "Test");
        expect(searchInput).equal("start");
        await userEvent.type(screen.getByRole("textbox"), "{escape}");

        await new Promise((resolve) => setTimeout(resolve, 550));
        expect(searchInput).equal("");
    });
});
