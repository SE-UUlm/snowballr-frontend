import { test as base } from "$tests/e2e/utils/fixtures/isolated-fixture";

/** Fixed point in time for every visual test, so relative and absolute dates never change. */
export const VISUAL_TEST_TIME = new Date("2026-01-15T10:00:00Z");

/**
 * Extends the isolated fixture (one fresh mock backend per test, so ids are stable) for visual tests:
 * - `page`: the browser clock is frozen at `VISUAL_TEST_TIME`.
 *
 * If some value can't be pinned, mask its element in the screenshot.
 */
export const test = base.extend({
    page: async ({ page }, use) => {
        await page.clock.setFixedTime(VISUAL_TEST_TIME);
        await use(page);
    },
});
