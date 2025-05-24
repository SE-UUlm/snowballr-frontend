import ShortcutsVisibilitySettings from "$lib/components/composites/settings/user-settings/ShortcutsVisibilitySettings.svelte";
import { shortcuts } from "$lib/global-state/shortcuts-visibility-state.svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";

describe("ShortcutsVisibilitySettings", () => {
    test("When the component is rendered, then a checkbox is shown allowing to toggle the shortcuts visibility", () => {
        render(ShortcutsVisibilitySettings);

        const shortcutsVisibilitySection = screen.getByTestId(
            "settings-section-shortcuts-visibility",
        );
        expect(shortcutsVisibilitySection).toBeInTheDocument();

        expect(screen.queryByText("Shortcuts Visibility")).toBeInTheDocument();
        expect(screen.queryByText("Display Shortcuts")).toBeInTheDocument();

        expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    test("When the checkbox is toggled, then the global shortcuts visibility state changes", () => {
        render(ShortcutsVisibilitySettings);
        expect(shortcuts.isVisible).toBe(true); // default to true

        screen.getByRole("switch").click();
        expect(shortcuts.isVisible).toBe(false);

        screen.getByRole("switch").click();
        expect(shortcuts.isVisible).toBe(true);
    });
});
