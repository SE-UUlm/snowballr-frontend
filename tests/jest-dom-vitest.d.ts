/*
 * Register the jest-dom matchers (e.g. `toBeInTheDocument`) on Vitest's `expect`.
 *
 * `@testing-library/jest-dom/vitest` augments `Assertion<T>`, which no longer merges with
 * Vitest 5's `Assertion<R, T>`. Augmenting `Matchers<R, T>` instead is the supported way to add custom matchers.
 */
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
    /* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars */
    interface Matchers<
        R extends void | Promise<void> = void | Promise<void>,
        T = unknown,
    > extends TestingLibraryMatchers<unknown, R> {}
    /* eslint-enable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars */
}
