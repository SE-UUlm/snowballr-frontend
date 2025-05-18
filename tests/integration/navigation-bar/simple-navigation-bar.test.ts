import { expect, test, describe } from "vitest";
import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
import { render, screen } from "@testing-library/svelte";
import { mockUserContext, waitForComponentLoading } from "../test-helper";

describe("SimpleNavigationBar", () => {
    test("When all props are provided, then whole navigation bar is shown", async () => {
        render(SimpleNavigationBar, {
            target: document.body,
            props: {
                backRef: "/",
                loadingTitle: Promise.resolve("Simple Navigation Bar"),
            },
            context: mockUserContext,
        });

        await waitForComponentLoading();

        // Title is shown
        const title = screen.getByText("Simple Navigation Bar");
        expect(title).toBeInTheDocument();
    });
});
