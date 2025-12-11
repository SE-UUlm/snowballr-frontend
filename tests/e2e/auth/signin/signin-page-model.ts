import { type Locator, type Page } from "@playwright/test";

export class SignInPageModel {
    readonly page: Page;
    readonly heading: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly signInButton: Locator;
    readonly signUpLink: Locator;
    readonly forgotPasswordLink: Locator;
    readonly errorAlert: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Sign In to SnowballR", exact: true });
        this.emailInput = page.getByLabel("Email", { exact: true });
        this.passwordInput = page.getByLabel("Password", { exact: true });
        this.signInButton = page.getByRole("button", { name: "Sign In", exact: true });
        this.signUpLink = page.getByRole("link", { name: "Sign Up", exact: true });
        this.forgotPasswordLink = page.getByRole("link", { name: "Forgot Password?", exact: true });
        this.errorAlert = page.getByRole("alert");
    }
}
