import { expect, test, describe } from "vitest";
import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
import { render, screen } from "@testing-library/svelte";
import { createUser } from "../../model-builder";

describe("SimpleNavigationBar", () => {
    test("When all props are provided, then whole navigation bar is shown", () => {
        render(SimpleNavigationBar, {
            target: document.body,
            props: {
                user: createUser({
                    firstName: "John",
                    lastName: "Doe",
                }),
                backRef: "/",
                title: "Simple Navigation Bar",
                tabs: [],
                defaultTabValue: "",
            },
        });

        // Title is shown
        const title = screen.getByText("Simple Navigation Bar");
        expect(title).toBeInTheDocument();
    });
});
