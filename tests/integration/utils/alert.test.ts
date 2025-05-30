import { describe, expect, test } from "vitest";
import TestAlert from "./TestAlert.svelte";
import { render, screen } from "@testing-library/svelte";

describe("Alert", () => {
    test("When all props are provided (default), then component is rendered correctly", () => {
        render(TestAlert, {
            target: document.body,
            props: {
                title: "Title Text",
                details: "Detail Text.",
                variant: "default",
            },
        });

        const title = screen.getByText("Title Text");
        const details = screen.getByText("Detail Text.");
        expect(title).toBeInTheDocument();
        expect(details).toBeInTheDocument();
    });

    test("When all props are provided (variant), then component is rendered correctly", () => {
        render(TestAlert, {
            target: document.body,
            props: {
                title: "Title Text",
                details: "Detail Text.",
                variant: "success",
            },
        });

        const title = screen.getByText("Title Text");
        const details = screen.getByText("Detail Text.");
        const icon = screen.getByRole("img");
        expect(title).toBeInTheDocument();
        expect(details).toBeInTheDocument();
        expect(icon).toBeInTheDocument();
    });
});
