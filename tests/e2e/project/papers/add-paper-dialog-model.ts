import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Titles the mock backend generates for papers that only the fetchers know about, i.e. papers that
 * carry no id and have to be created before they can be added.
 *
 * @param query - the search query the papers were generated for
 * @returns the titles of the generated papers
 */
export function fetcherOnlyPaperTitles(query: string): string[] {
    return [
        `A Survey of ${query}`,
        `${query}: A Systematic Literature Review`,
        `Towards a Better Understanding of ${query}`,
        `An Empirical Study on ${query}`,
        `Rethinking ${query} in Practice`,
    ];
}

/** Page object model of the "Search & Add" dialog of a stage on the project papers page. */
export class AddPaperDialogModel {
    readonly page: Page;
    readonly stageTrigger: Locator;
    readonly openDialogButton: Locator;
    readonly dialog: Locator;
    readonly searchInput: Locator;
    readonly localIncluded: Locator;
    readonly localExcluded: Locator;
    readonly fetchersIncluded: Locator;
    readonly fetchersExcluded: Locator;
    readonly availablePapers: Locator;
    readonly selectedPapers: Locator;
    readonly addButton: Locator;
    readonly cancelButton: Locator;
    readonly errorAlert: Locator;

    /** The sources most recently selected via {@link setSources}, so a search knows what to wait for. */
    private sources = { local: false, fetchers: true };

    constructor(page: Page) {
        this.page = page;
        this.stageTrigger = page.getByRole("button", { name: /^Stage 0/ });
        this.openDialogButton = page.getByRole("button", { name: "Search & Add" });
        this.dialog = page.getByTestId("dialog-content");
        this.searchInput = this.dialog.getByPlaceholder("Search Query");
        this.localIncluded = this.dialog.getByRole("button", { name: "Include Local Database" });
        this.localExcluded = this.dialog.getByRole("button", { name: "Exclude Local Database" });
        this.fetchersIncluded = this.dialog.getByRole("button", {
            name: "Include Fetcher Database",
        });
        this.fetchersExcluded = this.dialog.getByRole("button", {
            name: "Exclude Fetcher Database",
        });
        this.availablePapers = this.dialog.getByTestId("paper-available-to-be-added");
        this.selectedPapers = this.dialog.getByTestId("paper-to-be-added");
        this.addButton = this.dialog.getByRole("button", { name: /^Add \d+ Papers?$/ });
        this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
        this.errorAlert = this.dialog.getByRole("alert");
    }

    /**
     * Expands the stage the dialog belongs to, if it is not expanded already.
     *
     * The accordion starts collapsed and returns to that state whenever the page data is
     * invalidated, which is what happens after papers have been added.
     */
    async openStage() {
        await expect(this.stageTrigger).toBeVisible();
        if (!(await this.openDialogButton.isVisible())) {
            await this.stageTrigger.click();
        }
        await expect(this.openDialogButton).toBeVisible();
    }

    /** Returns a paper that is part of the stage, by its title. */
    getPaperInStage(title: string): Locator {
        return this.page.getByRole("button", { name: title });
    }

    /** Opens the dialog. The stage the button belongs to has to be open already. */
    async open() {
        await this.openDialogButton.click();
        await expect(this.dialog).toBeVisible();
    }

    /**
     * Switches the two candidate sources on or off.
     *
     * Each toggle shows its *current* state as its label, so turning a source on means clicking the
     * button that currently reads "Exclude ...", and vice versa.
     *
     * @param sources - which sources should be searched afterwards
     */
    async setSources(sources: { local: boolean; fetchers: boolean }) {
        const set = async (wanted: boolean, included: Locator, excluded: Locator) => {
            const toClick = wanted ? excluded : included;
            if (await toClick.isVisible()) await toClick.click();
            await expect(wanted ? included : excluded).toBeVisible();
        };

        await set(sources.local, this.localIncluded, this.localExcluded);
        await set(sources.fetchers, this.fetchersIncluded, this.fetchersExcluded);

        this.sources = { ...sources };
    }

    /**
     * Runs a search and waits for the result list to settle.
     *
     * @param query - the search query
     */
    async search(query: string) {
        // The searches of both sources have to be awaited explicitly. Without that, an assertion
        // that something is *not* offered would pass while the result list is still empty, and so
        // would hold no matter what the search eventually returns.
        const responses = [
            this.sources.local ? this.waitForSearch("SearchLocalProjectPaperCandidates") : null,
            this.sources.fetchers
                ? this.waitForSearch("SearchFetcherProjectPaperCandidates")
                : null,
        ].filter((it) => it !== null);

        await this.searchInput.fill(query);
        await this.searchInput.press("Enter");

        await Promise.all(responses);
        await expect(this.dialog.getByTestId("skeleton")).toHaveCount(0);
    }

    private waitForSearch(method: string) {
        return this.page.waitForResponse((response) => response.url().endsWith(`/${method}`));
    }

    /** Returns the entry of an offered paper by its title. */
    getAvailablePaper(title: string): Locator {
        return this.availablePapers.filter({ hasText: title });
    }

    /** Returns the entry of a selected paper by its title. */
    getSelectedPaper(title: string): Locator {
        return this.selectedPapers.filter({ hasText: title });
    }

    /**
     * Moves an offered paper into the list of papers to be added.
     *
     * @param title - the title of the paper to select
     */
    async selectPaper(title: string) {
        await this.getAvailablePaper(title).getByTestId("add-paper-to-selected").click();
        await expect(this.getSelectedPaper(title)).toBeVisible();
    }

    /**
     * Removes a paper from the list of papers to be added.
     *
     * @param title - the title of the paper to deselect
     */
    async deselectPaper(title: string) {
        await this.getSelectedPaper(title).getByTestId("remove-paper-from-selected").click();
        await expect(this.getSelectedPaper(title)).toBeHidden();
    }

    /** Confirms the selection and waits for the dialog to close. */
    async addSelectedPapers() {
        await this.addButton.click();
        await expect(this.dialog).toBeHidden();
    }
}
