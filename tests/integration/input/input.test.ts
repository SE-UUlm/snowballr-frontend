import Input from "$lib/components/composites/input/Input.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import ExampleInput from "./ExampleInput.svelte";

describe("Input", () => {
    test("When props are provided, then label, link and input is shown", () => {
        const input = render(Input, {
            target: document.body,
            props: {
                inputId: "input",
                label: "Input Label",
                placeholder: "Input",
                required: true,
                type: "text",
                link: {
                    href: "https://example.com",
                    text: "Example Link",
                },
                schema: z.string().min(1).max(10),
                value: "Example",
            },
        });

        // Label exists
        const label = document.getElementsByTagName("label")[0];
        expect(label).toBeInTheDocument();
        expect(label).toHaveTextContent("Input Label");

        // Link exists
        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        expect(link).toHaveTextContent("Example Link");
        expect(link).toHaveAttribute("href", "https://example.com");

        // Input exists
        const inputElement = document.getElementById("input");
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toHaveAttribute("placeholder", "Input");
        expect(inputElement).toHaveAttribute("required");
        expect(inputElement).toHaveAttribute("type", "text");
        expect(inputElement).toHaveValue("Example");

        // Error messages do not exist
        let errorMessages = document.getElementsByTagName("p");
        expect(errorMessages).toHaveLength(0);

        // When input is validated, then no error messages are shown
        expect(input.component.validate()).toBe(true);
        errorMessages = document.getElementsByTagName("p");
        expect(errorMessages).toHaveLength(0);
        expect(input.component.getValue()).toBe("Example");
    });

    test("When props are provided and input is invalid, then error messages are shown", async () => {
        const input = render(Input, {
            target: document.body,
            props: {
                inputId: "input",
                label: "Input",
                placeholder: "Input",
                required: true,
                type: "text",
                link: {
                    href: "https://example.com",
                    text: "Example Link",
                },
                schema: z.string().min(10).max(20),
                value: "Example",
            },
        });

        // Error messages do not exist
        let errorMessages = document.getElementsByTagName("p");
        expect(errorMessages).toHaveLength(0);

        // When input is validated, then error messages are shown
        expect(input.component.validate()).toBe(false);
        await waitFor(() => {
            errorMessages = document.getElementsByTagName("p");
            expect(errorMessages).toHaveLength(1);
        });
        expect(errorMessages[0]).toHaveTextContent("String must contain at least 10 character(s)");
    });

    test("When a button is provided, then button is shown and can be clicked.", () => {
        let isClicked = false;
        render(ExampleInput, {
            target: document.body,
            props: {
                onClick: () => {
                    isClicked = true;
                },
            },
        });

        // Button exists
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("This is the button");

        // When button is clicked, then onClick is called
        button.click();
        expect(isClicked).toBe(true);
    });
});
