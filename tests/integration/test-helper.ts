import { waitFor, screen } from "@testing-library/svelte";
import { expect } from "vitest";

/**
 * Awaits until all skeletons are removed from the screen.
 *
 * To wait for a skeleton to load, the skeleton must have a data-testid attribute with the value 'skeleton'.
 */
export function waitForComponentLoading(): Promise<void> {
    return waitFor(() => {
        // The data-testid may be overwritten, so we don't match exactly 'skeleton'.
        const skeletons = screen.queryAllByTestId("skeleton", { exact: false });
        expect(skeletons).toHaveLength(0);
    });
}
