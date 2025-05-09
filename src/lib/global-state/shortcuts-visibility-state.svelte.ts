import { getLocalStorageItem, setLocalStorageItem } from "./local-storage-helper";

const STORAGE_KEY = "showShortcuts";
const initialValue = getLocalStorageItem<boolean>(STORAGE_KEY, true);

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

        setLocalStorageItem<boolean>(STORAGE_KEY, newValue);
    },
};
