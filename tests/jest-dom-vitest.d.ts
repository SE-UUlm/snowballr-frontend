// Vitest 5 changed `Assertion<T>` to `Assertion<R, T>`, which breaks the module augmentation
// shipped in `@testing-library/jest-dom/vitest`. Re-declare it against the new `Matchers<R, T>`.
// Remove once jest-dom supports Vitest 5 types, see https://github.com/SE-UUlm/snowballr-frontend/issues/755
import "vitest";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
    // `T` must be declared to match the original signature for declaration merging.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    interface Matchers<R = any, T = any> extends TestingLibraryMatchers<any, R> {}
}
