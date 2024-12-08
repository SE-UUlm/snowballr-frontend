import PasswordInput from "$lib/components/composites/input/PasswordInput.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import { assert, describe, expect, test } from "vitest";

describe("PasswordInput", () => {
    const validPassword = "z's?c].e2x<@($\"<#;\\A]]3D@F)/^v^!";

    test("When props are provided, then label, link and input are shown", () => {
        render(PasswordInput, {
            target: document.body,
            props: {
                value: validPassword,
                showForgotPasswordLink: true,
            },
        });

        // Label exists
        const label = document.getElementsByTagName("label")[0];
        expect(label).toBeInTheDocument();
        expect(label).toHaveTextContent("Password");

        // Link exists
        const link = document.getElementsByTagName("a")[0];
        expect(link).toBeInTheDocument();
        expect(link).toHaveTextContent("Forgot your password?");

        // Input exists
        const inputElement = document.getElementById("password-input");
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toHaveAttribute("placeholder", "");
        expect(inputElement).toHaveAttribute("required");
        expect(inputElement).toHaveAttribute("type", "password");

        // Validation criteria is shown
        const validationCriteria = screen.getAllByTestId("validation-criterion");
        expect(validationCriteria.length).toBeGreaterThan(0);
    });

    test("When valid password is inserted, then validation criteria are met", async () => {
        const { component } = render(PasswordInput, {
            target: document.body,
            props: {
                value: validPassword,
            },
        });

        // When input is validated, then no error messages are shown
        expect(component.validate()).toBe(true);
        await waitFor(() => {
            assert.doesNotThrow(() => screen.getAllByTestId("validation-criterion"));
        });
        const validationCriteria = screen.getAllByTestId("validation-criterion");
        expect(validationCriteria.length).toBeGreaterThan(0);
        assert.doesNotThrow(() => screen.getAllByTestId("validation-success"));
        assert.throws(() => screen.getAllByTestId("validation-fail"));
        expect(component.getValue()).toBe(validPassword);
    });

    test("When invalid password is inserted, then error messages are shown", async () => {
        const { component } = render(PasswordInput, {
            target: document.body,
            props: {
                value: "aB 1!",
            },
        });

        // When input is validated, then error messages are shown
        expect(component.validate()).toBe(false);
        await waitFor(() => {
            assert.doesNotThrow(() => screen.getAllByTestId("validation-criterion"));
        });
        const validationCriteria = screen.getAllByTestId("validation-criterion");
        expect(validationCriteria.length).toBeGreaterThan(0);
        assert.throws(() => screen.getAllByTestId("validation-success"));
        assert.doesNotThrow(() => screen.getAllByTestId("validation-fail"));
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

    test("When `showForgotPasswordLink` is false, then link is not shown", () => {
        render(PasswordInput, {
            target: document.body,
            props: {
                showForgotPasswordLink: false,
            },
        });

        const link = document.getElementsByTagName("a");
        expect(link).toHaveLength(0);
    });
});
