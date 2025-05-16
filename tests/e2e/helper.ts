import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Reloads the page and waits for it to be completely loaded.
 *
 * To ensure that the page has been fully loaded,
 * provide an element whose visibility should be waited for.
 * If possible, this element should be the last to become visible.
 *
 * @param page - The page to reload
 * @param element - The element to be waited for
 */
export async function reloadWait(page: Page, element: Locator) {
    await page.reload();
    await expect(element).toBeVisible();
}

/**
 * Gets the first and last name of the currently logged-in user.
 *
 * This function assumes that the user is logged in and the user menu is visible.
 * It opens the user menu, retrieves the user's name, and closes the menu again.
 *
 * **Note**: This function is only necessary because the user name is changed in other tests and they interfere with each other.
 *
 * @param page - the current page
 * @returns the first and last name of the user
 */
export async function getNameOfCurrentUser(
    page: Page,
): Promise<{ firstName: string; lastName: string }> {
    await page.getByRole("button", { name: /^[A-Z]{2}$/ }).click();
    const userNameLocator = page.getByRole("group", { name: /^[a-zA-Z]+ [a-zA-Z]+$/, exact: true });
    await expect(userNameLocator).toBeVisible();
    const userName = await userNameLocator.textContent().then((text) => text!.trim());
    await page.mouse.click(0, 0); // Close the menu again (click background)
    await expect(userNameLocator).not.toBeVisible();
    const [firstName, lastName] = userName!.split(" ");
    return { firstName, lastName };
}
