import { type Locator, type Page } from "@playwright/test";

export class PaperViewPageModel {
    readonly page: Page;
    readonly informationButton: Locator;
    readonly showMoreInformationButton: Locator;
    readonly showLessInformationButton: Locator;
    readonly allListEntries: Locator;
    readonly generalInformationLabel: Locator;
    readonly publicationTypeLabel: Locator;
    readonly publicationNameLabel: Locator;
    readonly externalIdsLabel: Locator;

    readonly projectName: string;
    readonly paperNames: string[];

    constructor(page: Page) {
        this.page = page;
        this.informationButton = page.getByRole("tab", { name: "Information", exact: true });
        this.showMoreInformationButton = page.getByRole("button", {
            name: "Show more information",
            exact: true,
        });
        this.showLessInformationButton = page.getByRole("button", {
            name: "Show less information",
            exact: true,
        });
        this.allListEntries = page.getByRole("listitem");
        this.generalInformationLabel = page.getByText("General Information");
        this.publicationTypeLabel = page.getByText("Publication Type");
        this.publicationNameLabel = page.getByText("Publication Name");
        this.externalIdsLabel = page.getByText("External IDs");

        this.projectName = "Project 1";
        this.paperNames = ["Paper View - Paper 0", "Paper View - Paper 1"];
    }

    /**
     * Navigates to the paper with the given index in the reference paper entry list.
     *
     * @param index - index of the paper to navigate to
     */
    async navigateToReferencePaper(index: number = 0) {
        await this.getReferencesListEntry(index).click();
    }

    /**
     * Navigates to the paper with the given index in the citation paper entry list.
     *
     * @param index - index of the paper to navigate to
     */
    async navigateToCitationPaper(index: number = 0) {
        await this.getCitationsListEntry(index).click();
    }

    /**
     * If the paper view heading matches the given paper title, the method returns the paper view heading.
     *
     * @param paperTitle - the text the heading must match
     * @returns the paper view heading
     */
    getHeading(paperTitle: string) {
        return this.page.getByRole("navigation").getByText(paperTitle, { exact: false });
    }

    /**
     * Searches for the paper list entry with the given index in the reference list
     *
     * @param index - index of the paper in the reference list
     * @returns a paper list entry of the reference list
     */
    getReferencesListEntry(index: number): Locator {
        return this.allListEntries
            .filter({
                hasText: `Paper View - Paper ${index}`,
            })
            .first();
    }

    /**
     * Searches for the paper list entry with the given index in the citation list
     *
     * @param index - index of the paper in the citation list
     * @returns a paper list entry of the citation list
     */
    getCitationsListEntry(index: number): Locator {
        return this.allListEntries
            .filter({
                hasText: `Paper View - Paper ${index}`,
            })
            .nth(1);
    }

    /**
     * Returns the button to add/remove a paper to/from the reading list
     *
     * @param add - whether the button is the "add to" or "remove from" button
     */
    getReadingListButton(add: boolean) {
        return this.page.getByRole("button", {
            name: `${add ? "Add to" : "Remove from"} reading list`,
        });
    }
}
