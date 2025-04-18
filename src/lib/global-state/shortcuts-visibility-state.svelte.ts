import { browser } from "$app/environment";

const STORAGE_KEY = "showShortcuts";
let initialValue = true;

if (browser) {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (storedValue !== null) {
        try {
            const parsedValue = JSON.parse(storedValue);
            if (typeof parsedValue === "boolean") {
                initialValue = parsedValue;
            }
        } catch (error) {
            console.error(`Error parsing ${STORAGE_KEY} from local storage:`, error);
            initialValue = true;
        }
    }
}

/**
 * Stores, whether shortcuts are visible for the current user or not.
 *
 * The default state is active, so if the user has not set anything yet, the shortcuts are visible.
 * The state is stored in local storage, so it persists across sessions.
 */
let shortcutsVisibilityState = $state(initialValue);

export const shortcuts = {
    get isVisible() {
        return shortcutsVisibilityState;
    },
    set isVisible(value: boolean) {
        const newValue = !!value;
        shortcutsVisibilityState = newValue;

        if (browser) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
            } catch (error) {
                console.error(`Error saving ${STORAGE_KEY} to local storage:`, error);
            }
        }
    },
};
