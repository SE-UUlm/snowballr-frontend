import { type Locator, type Page } from "@playwright/test";

export class InvitationsPageModel {
    readonly page: Page;
    readonly heading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Invitations", exact: true });
    }
}
