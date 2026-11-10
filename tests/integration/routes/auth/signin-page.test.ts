import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import SignInPage from "../../../../src/routes/(auth)/signin/+page.svelte";
import { mockFailedApiCall } from "$tests/setupTest";

async function submitCredentials() {
    const user = userEvent.setup();
    render(SignInPage, { target: document.body });

    await user.type(screen.getByRole("textbox", { name: /email/i }), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign In" }));
}

describe("Sign-in page", () => {
    test("When the credentials are wrong, then 'Invalid Credentials' is shown", async () => {
        mockFailedApiCall("login", "wrong password", "UNAUTHENTICATED");

        await submitCredentials();

        expect(await screen.findByText("Invalid Credentials")).toBeInTheDocument();
    });

    test("When signing in fails for another reason, then 'Sign In Failed' is shown", async () => {
        mockFailedApiCall("login", "backend down", "UNAVAILABLE");

        await submitCredentials();

        expect(await screen.findByText("Sign In Failed")).toBeInTheDocument();
    });
});
