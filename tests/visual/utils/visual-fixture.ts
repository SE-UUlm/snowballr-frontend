import { test as base } from "$tests/e2e/utils/fixtures/isolated-fixture";
import { seedVisualData, type VisualData } from "./visual-data";
import { pinProjectInformation } from "./pin-project-information";

/** Fixed point in time for every visual test, so relative and absolute dates never change. */
export const VISUAL_TEST_TIME = new Date("2026-01-15T10:00:00Z");

/** Fixed project dates reported instead of the mock backend's, see `pinProjectInformation`. */
export const PROJECT_CREATION_DATE = new Date("2025-12-01T09:00:00Z");
export const PROJECT_LAST_STAGE_STARTED = new Date("2026-01-05T09:00:00Z");

/**
 * Extends the isolated fixture (one fresh mock backend per test, so ids are stable) for visual tests:
 * - `page`: the browser clock is frozen at `VISUAL_TEST_TIME`, and the project dates the mock
 *   backend sets from its own clock are replaced with fixed ones.
 * - `visualData`: the fixed data from `visual-data.ts`, seeded for the authenticated user.
 *   Only seeded if a test requests it, so tests of empty states stay empty.
 *
 * If some other value can't be pinned, mask its element in the screenshot.
 */
export const test = base.extend<{ visualData: VisualData }>({
    page: async ({ page, mockBackend }, use) => {
        await page.clock.setFixedTime(VISUAL_TEST_TIME);
        await pinProjectInformation(page, mockBackend, {
            creationDate: PROJECT_CREATION_DATE,
            lastStageStarted: PROJECT_LAST_STAGE_STARTED,
        });
        await use(page);
    },
    visualData: async ({ apiClient }, use) => {
        await use(await seedVisualData(apiClient));
    },
});
