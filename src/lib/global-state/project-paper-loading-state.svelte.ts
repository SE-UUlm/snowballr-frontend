import { getLocalStorageItem, setLocalStorageItem } from "./local-storage-helper";

const STORAGE_KEY = "projectPaperLoading";
const initialValue = getLocalStorageItem<boolean>(STORAGE_KEY, true);

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
