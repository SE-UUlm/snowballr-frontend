import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import SignUpPage from "../../../../src/routes/(auth)/signup/+page.svelte";
import { mockFailedApiCall } from "$tests/setupTest";

async function submitRegistration() {
    const user = userEvent.setup();
    render(SignUpPage, { target: document.body });

    await user.type(screen.getByRole("textbox", { name: /first name/i }), "Jane");
    await user.type(screen.getByRole("textbox", { name: /last name/i }), "Doe");
    await user.type(screen.getByRole("textbox", { name: /email/i }), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "AbCd12!?xy");
    await user.click(screen.getByRole("button", { name: "Create an account" }));
}

describe("Sign-up page", () => {
    test("When the email address is taken, then 'Email already Registered' is shown", async () => {
        mockFailedApiCall("register", "email already in use", "ALREADY_EXISTS");

        await submitRegistration();

        expect(await screen.findByText("Email already Registered")).toBeInTheDocument();
    });

    test("When registering fails for another reason, then 'Registration Failed' is shown", async () => {
        mockFailedApiCall("register", "backend down", "UNAVAILABLE");

        await submitRegistration();

        expect(await screen.findByText("Registration Failed")).toBeInTheDocument();
    });
});
