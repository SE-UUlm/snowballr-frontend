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

/**
 * Grows the viewport until no scroll area overflows anymore.
 *
 * The app's layout fills the screen and scrolls its content inside scroll areas, so `fullPage`
 * screenshots only contain what fits into the viewport. Growing the viewport by the overflow
 * makes the complete content visible in a single screenshot.
 *
 * @param page - the current page
 */
export async function expandViewportToFitScrollAreas(page: Page) {
    const viewport = page.viewportSize();
    if (viewport === null) throw new Error("The page has no fixed viewport size.");

    // The layout may reflow after resizing, so repeat until nothing overflows anymore.
    for (let attempt = 0; attempt < 3; attempt++) {
        const overflow = await page
            .locator('[data-slot="scroll-area-viewport"]')
            .evaluateAll((areas) =>
                Math.max(0, ...areas.map((area) => area.scrollHeight - area.clientHeight)),
            );
        if (overflow === 0) return;

        const { width, height } = page.viewportSize()!;
        await page.setViewportSize({ width, height: height + overflow });
    }
    throw new Error("The scroll areas still overflow after growing the viewport.");
}
