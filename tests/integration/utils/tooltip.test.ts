import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import TestToolTip from "./TestToolTip.svelte";
import userEvent from "@testing-library/user-event";

describe("Tooltip", () => {
    test("When all props are provided, then component is rendered correctly", () => {
        render(TestToolTip, {
            target: document.body,
            props: {
                triggerText: "Hover me",
                contentText: "Hello, world!",
                openOnClick: false,
            },
        });

        const trigger = screen.getByText("Hover me");
        expect(trigger).toBeInTheDocument();
    });

    test("When trigger is hovered, then content is displayed", async () => {
        const user = userEvent.setup();
        render(TestToolTip, {
            target: document.body,
            props: {
                triggerText: "Hover me",
                contentText: "Hello, world!",
                openOnClick: false,
            },
        });

        const trigger = screen.getByText("Hover me");
        await user.hover(trigger);

        const content = await screen.findByText("Hello, world!");
        expect(content).toBeInTheDocument();
    });

    test("When `openOnClick` is true, then content is displayed on click", async () => {
        const user = userEvent.setup();
        render(TestToolTip, {
            target: document.body,
            props: {
                triggerText: "Click me",
                contentText: "Hello, world!",
                openOnClick: true,
            },
        });

        const trigger = screen.getByText("Click me");
        await user.click(trigger);

        const content = await screen.findByText("Hello, world!");
        expect(content).toBeInTheDocument();
    });

    test("When `openOnClick` is false, then content is not displayed on click", async () => {
        const user = userEvent.setup();
        render(TestToolTip, {
            target: document.body,
            props: {
                triggerText: "Click me",
                contentText: "Hello, world!",
                openOnClick: false,
            },
        });

        const trigger = screen.getByText("Click me");
        await user.click(trigger);

        await expect(async () => {
            await screen.findByText("Hello, world!");
        }).rejects.toThrowError();
    });
});
