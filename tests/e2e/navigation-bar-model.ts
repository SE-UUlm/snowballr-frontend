import { type Locator, type Page } from "@playwright/test";

export class NavigationBarModel {
    readonly page: Page;
    readonly goBackButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.goBackButton = this.page.getByRole("link", { name: "Back to" });
    }

    /**
     * Returns the user avatar button based on the provided initials.
     *
     * If no initials are provided, it returns a button whose name consists of two uppercase letters.
     * If initials are provided, it returns the button that exactly matches those initials.
     *
     * @param initials - The expected initials on the avatar button (optional).
     */
    getUserAvatarButton(initials?: string) {
        if (!initials) {
            return this.page.getByRole("button", { name: /^[A-Z]{2}$/ });
        }
        return this.page.getByRole("button", { name: initials, exact: true });
    }

    /**
     * Returns the reading list navigation bar link. If shortcuts is true, then the link text
     * includes the shortcut, otherwise not.
     *
     * @param shortcuts - true, if the link text shall include the shortcut
     */
    getReadingListLink(shortcuts: boolean = true) {
        if (shortcuts) {
            return this.page.getByRole("link", { name: /Reading List.+/ });
        }
        return this.page.getByRole("link", { name: "Reading List", exact: true });
    }

    /**
     * Returns the archived projects navigation bar link. If shortcuts is true, then the link text
     * includes the shortcut, otherwise not.
     *
     * @param shortcuts - true, if the link text shall include the shortcut
     */
    getArchivedProjectsLink(shortcuts: boolean = true) {
        if (shortcuts) {
            return this.page.getByRole("link", { name: /Archived Projects.+/ });
        }
        return this.page.getByRole("link", { name: "Archived Projects", exact: true });
    }

    /**
     * Returns the invitations navigation bar link. If shortcuts is true, then the link text
     * includes the shortcut, otherwise not.
     *
     * @param shortcuts - true, if the link text shall include the shortcut
     */
    getInvitationsLink(shortcuts: boolean = true) {
        if (shortcuts) {
            return this.page.getByRole("link", { name: /Invitations.+/ });
        }
        return this.page.getByRole("link", { name: "Invitations", exact: true });
    }

    /**
     * Returns the setting navigation bar link. If shortcuts is true, then the link text
     * includes the shortcut, otherwise not.
     *
     * @param shortcuts - true, if the link text shall include the shortcut
     */
    getSettingsLink(shortcuts: boolean = true) {
        if (shortcuts) {
            return this.page.getByRole("link", { name: /Settings.+/ });
        }
        return this.page.getByRole("link", { name: "Settings", exact: true });
    }

    /**
     * Returns the sign out navigation bar link. If shortcuts is true, then the link text
     * includes the shortcut, otherwise not.
     *
     * @param shortcuts - true, if the link text shall include the shortcut
     */
    getSignOutLink(shortcuts: boolean = true) {
        if (shortcuts) {
            return this.page.getByRole("link", { name: /Sign Out.+/ });
        }
        return this.page.getByRole("link", { name: "Sign Out", exact: true });
    }
}
