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
