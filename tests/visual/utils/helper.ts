import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Navigates to `url` and waits until the page has settled: `ready` is visible and there are no
 * more pending requests, so no skeletons or spinners end up in the screenshot.
 *
 * @param page - the page to navigate
 * @param url - the url to navigate to
 * @param ready - an element that is only visible once the page has loaded its data
 */
export async function gotoAndSettle(page: Page, url: string, ready: Locator) {
    await page.goto(url);
    await settle(page, ready);
}

/**
 * Waits until `ready` is visible and there are no more pending requests.
 *
 * @param page - the current page
 * @param ready - an element that is only visible once the page (or component) has loaded
 */
export async function settle(page: Page, ready: Locator) {
    await expect(ready).toBeVisible();
    await page.waitForLoadState("networkidle");
}
