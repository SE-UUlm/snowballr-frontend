import { getLocalStorageItem, setLocalStorageItem } from "./local-storage-helper";

const STORAGE_KEY = "maybeAsDecision";
const initialValue = getLocalStorageItem<boolean>(STORAGE_KEY, true);

/**
 * Stores, whether 'Maybe' is allowed as decision as review or not.
 * This is only used to perfect the visualization of the review mode and is not actually used to en- or disable the review buttons.
 *
 * Teh default state is active, so if no preference is changed, the 'Mabye' option is enabled.
 */
let maybeAsDecisionState = $state(initialValue);

export const maybeAsDecision = {
    get isActivated() {
        return maybeAsDecisionState;
    },
    set isActivated(value: boolean) {
        maybeAsDecisionState = value;

        setLocalStorageItem<boolean>(STORAGE_KEY, value);
    },
};
