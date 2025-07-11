import { getLocalStorageItem, setLocalStorageItem } from "./local-storage-helper";

const STORAGE_KEY = "projectPaperLoading";
const initialValue = getLocalStorageItem<boolean>(STORAGE_KEY, false);

/**
 * Stores, whether the current project paper is fully loaded or not.
 * This is used to make it possible to enable the review decision and the paper navigation buttons
 * as soon as the project paper is loaded.
 *
 * The default state is false, so that the buttons are disabled until the flag is actively set to
 * true.
 */
let projectPaperLoadingState = $state(initialValue);

export const projectPaperLoading = {
    get isLoading() {
        return projectPaperLoadingState;
    },
    set isLoading(value: boolean) {
        projectPaperLoadingState = value;

        setLocalStorageItem<boolean>(STORAGE_KEY, value);
    },
};
