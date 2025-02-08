import { waitFor, screen } from "@testing-library/svelte";
import { expect } from "vitest";

export function waitForComponentLoading(): Promise<void> {
    return waitFor(() => {
        const skeletons = screen.queryAllByTestId("skeleton");
        expect(skeletons).toHaveLength(0);
    });
}
