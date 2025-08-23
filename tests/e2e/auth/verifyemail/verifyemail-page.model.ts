import { type Locator, type Page } from "@playwright/test";

export class VerifyEmailPageModel {
    readonly page: Page;
    readonly heading: Locator;
    readonly body: Locator;
    readonly goToSignInButton: Locator;
    readonly backToSignUpButton: Locator;
    readonly verifyingHeadline: Locator;
    readonly verifyingBody: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.locator("h1");
        this.body = page.locator("div.text-default");
        this.goToSignInButton = page.getByRole("button", { name: "Go to Sign In" });
        this.backToSignUpButton = page.getByRole("button", { name: "Back to Sign Up" });
        this.verifyingHeadline = page.getByRole("heading", { name: "Verifying..." });
        this.verifyingBody = page.getByText("Please wait while we check your verification link.");
    }
}
