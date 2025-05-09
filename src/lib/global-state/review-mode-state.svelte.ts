import { getLocalStorageItem, setLocalStorageItem } from "./local-storage-helper";

const STORAGE_KEY = "reviewMode";
const initialValue = getLocalStorageItem<boolean>(STORAGE_KEY, true);

/**
 * Stores, whether the "Review" mode is active for the current user or not.
 *
 * The default state is active, so if not preference is changed, the review mode is on
 * and no review information are shown.
 */
let reviewModeState = $state(initialValue);

export const reviewMode = {
    get isActivated() {
        return reviewModeState;
    },
    set isActivated(value: boolean) {
        reviewModeState = value;

        setLocalStorageItem<boolean>(STORAGE_KEY, value);
    },
};
