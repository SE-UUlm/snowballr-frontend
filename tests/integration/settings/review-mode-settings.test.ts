import ReviewModeSettings from "$lib/components/composites/settings/user-settings/ReviewModeSettings.svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { reviewMode } from "$lib/global-state/review-mode-state.svelte";

describe("ReviewModeSettings", () => {
    it("When component is rendered, then a switch is shown allowing to toggle the review mode", () => {
        render(ReviewModeSettings);

        const reviewModeSection = screen.getByTestId("settings-section-review-mode");
        expect(reviewModeSection).toBeInTheDocument();

        expect(screen.queryByText("Review mode")).toBeInTheDocument();
        expect(screen.queryByText('Activate the "Review" mode')).toBeInTheDocument();

        expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("When switch is toggled, then the global review mode state changes", () => {
        render(ReviewModeSettings);
        expect(reviewMode.isActivated).toBe(true); // default to true

        screen.getByRole("switch").click();
        expect(reviewMode.isActivated).toBe(false);

        screen.getByRole("switch").click();
        expect(reviewMode.isActivated).toBe(true);
    });
});
