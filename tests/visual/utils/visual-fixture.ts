import { test as base } from "$tests/e2e/utils/fixtures/isolated-fixture";
import { seedVisualData, type VisualData } from "./visual-data";

/** Fixed point in time for every visual test, so relative and absolute dates never change. */
export const VISUAL_TEST_TIME = new Date("2026-01-15T10:00:00Z");

/**
 * Extends the isolated fixture (one fresh mock backend per test, so ids are stable) for visual tests:
 * - `page`: the browser clock is frozen at `VISUAL_TEST_TIME`.
 * - `visualData`: the fixed data from `visual-data.ts`, seeded for the authenticated user.
 *   Only seeded if a test requests it, so tests of empty states stay empty.
 *
 * If some value can't be pinned, mask its element in the screenshot.
 */
export const test = base.extend<{ visualData: VisualData }>({
    page: async ({ page }, use) => {
        await page.clock.setFixedTime(VISUAL_TEST_TIME);
        await use(page);
    },
    visualData: async ({ apiClient }, use) => {
        await use(await seedVisualData(apiClient));
    },
});
