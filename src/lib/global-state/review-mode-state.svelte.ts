import { browser } from "$app/environment";

/**
 * Stores, whether the "Review" mode is active for the current user or not.
 *
 * The default state is active, so if not preference is changed, the review mode is on
 * and no review information are shown.
 */
let reviewModeState = $state(true);

export const reviewMode = {
    get isActivated() {
        return reviewModeState;
    },
    set isActivated(value: boolean) {
        reviewModeState = value;
        if (browser) {
            localStorage.setItem("reviewMode", JSON.stringify(reviewModeState));
        }
    },
};
