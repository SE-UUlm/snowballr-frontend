import PasswordInput from "$lib/components/composites/input/PasswordInput.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";

describe("PasswordInput", () => {
    const validPassword = "z's?c].e2x<@($\"<#;\\A]]3D@F)/^v^!";

    test("When props are provided, then label and input are shown", () => {
        render(PasswordInput, {
            target: document.body,
            props: {
                value: validPassword,
            },
        });

        // Label exists
        const label = document.getElementsByTagName("label")[0];
        expect(label).toBeInTheDocument();
        expect(label).toHaveTextContent("Password");

        // Input exists
        const inputElement = document.getElementById("password-input");
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toHaveAttribute("placeholder", "");
        expect(inputElement).toHaveAttribute("required");
        expect(inputElement).toHaveAttribute("type", "password");

        // Error messages do not exist
        const errorMessages = document.getElementsByTagName("p");
        expect(errorMessages).toHaveLength(0);
    });

    test("When valid password is inserted, then no error messages are shown", async () => {
        const input = render(PasswordInput, {
            target: document.body,
            props: {
                value: validPassword,
            },
        });

        // When input is validated, then no error messages are shown
        expect(input.component.validate()).toBe(true);
        await waitFor(() => {
            const errorMessages = document.getElementsByTagName("p");
            expect(errorMessages).toHaveLength(0);
            expect(input.component.getValue()).toBe(validPassword);
        });
    });

    test("When invalid password is inserted, then error messages are shown", async () => {
        const input = render(PasswordInput, {
            target: document.body,
            props: {
                value: "aB 1!",
            },
        });

        // When input is validated, then error messages are shown
        expect(input.component.validate()).toBe(false);
        await waitFor(() => {
            const errorMessages = document.getElementsByTagName("p");
            expect(errorMessages.length).toBeGreaterThan(0);
        });
    });

    test("When button is clicked, then password is displayed as text", async () => {
        render(PasswordInput, {
            target: document.body,
            props: {
                value: "Example",
            },
        });

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();

        const input = document.getElementById("password-input");

        expect(input).toHaveAttribute("type", "password");

        button.click();
        await waitFor(() => {
            expect(input).toHaveAttribute("type", "text");
        });

        button.click();
        await waitFor(() => {
            expect(input).toHaveAttribute("type", "password");
        });
    });
});
