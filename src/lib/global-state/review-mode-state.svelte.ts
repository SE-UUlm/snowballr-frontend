import { browser } from "$app/environment";

/**
 * Stores, whether the "Review" mode is active for the current user or not
 */
let reviewModeState = $state(browser && localStorage.getItem("reviewMode") === "true");

export const reviewMode = {
    get isActivated() {
        return reviewModeState;
    },
    set isActivated(value: boolean) {
        if (browser) {
            localStorage.setItem("reviewMode", `${reviewMode.isActivated}`);
        }
        reviewModeState = value;
    },
};
