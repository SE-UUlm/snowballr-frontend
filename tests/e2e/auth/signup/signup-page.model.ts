import { type Locator, type Page } from "@playwright/test";

export class SignUpPageModel {
    readonly page: Page;
    readonly heading: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly signUpButton: Locator;
    readonly signInLink: Locator;
    readonly errorAlert: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Sign Up to SnowballR", exact: true });
        this.firstNameInput = page.getByLabel("First Name", { exact: true });
        this.lastNameInput = page.getByLabel("Last Name", { exact: true });
        this.emailInput = page.getByLabel("Email", { exact: true });
        this.passwordInput = page.getByLabel("Password", { exact: true });
        this.signUpButton = page.getByRole("button", { name: "Create an account", exact: true });
        this.signInLink = page.getByRole("link", { name: "Sign In", exact: true });
        this.errorAlert = page.getByRole("alert");
    }
}
