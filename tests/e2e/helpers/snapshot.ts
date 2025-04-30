import { expect, type Page, type PageAssertionsToHaveScreenshotOptions } from "@playwright/test";

/**
 * Takes a screenshot of the current page and compares it to a reference image.
 *
 * This function is used to verify that the UI of the application has not changed unexpectedly.
 *
 * @example
 * ```ts
 * import { expectMatchingScreenshot } from "./helpers/snapshot";
 *
 * test("...", async ({ page }) => {
 *   await page.goto("/some-page");
 *   await expectMatchingScreenshot(page, ["foo", "bar"]);
 * });
 * ```
 * The image is stored at `<snapshots-path>/foo/bar/img.png`.
 *
 * @param page - The Playwright page object.
 * @param paths - The path segments to the baseline image.
 * @param options - Options for the screenshot comparison.
 */
export async function expectMatchingScreenshot(
    page: Page,
    paths: string[] = [],
    options: PageAssertionsToHaveScreenshotOptions | undefined = undefined,
) {
    await expect(page).toHaveScreenshot([...paths, "img.png"], options);
}
