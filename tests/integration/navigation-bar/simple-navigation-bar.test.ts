import { expect, test, describe } from "vitest";
import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
import { render, screen } from "@testing-library/svelte";
import { createUser, loading } from "../../model-builder";
import { waitForComponentLoading } from "../test-helper";

describe("SimpleNavigationBar", () => {
    test("When all props are provided, then whole navigation bar is shown", async () => {
        render(SimpleNavigationBar, {
            target: document.body,
            props: {
                user: createUser({
                    firstName: "John",
                    lastName: "Doe",
                }),
                backRef: "/",
                loadingTitle: loading("Simple Navigation Bar"),
            },
        });

        await waitForComponentLoading();

        // Title is shown
        const title = screen.getByText("Simple Navigation Bar");
        expect(title).toBeInTheDocument();
    });
});
