import { type Page } from "@playwright/test";

export class ProjectDashboardModel {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    getHeader(paperTitle: string) {
        return this.page.getByRole("navigation").getByText(paperTitle, { exact: false });
    }
}
