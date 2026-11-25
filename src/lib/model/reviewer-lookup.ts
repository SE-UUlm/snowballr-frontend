import { getUserById } from "#lib/api/user.js";
import type { User } from "#lib/api/types.js";

/**
 * Looks up the users who wrote reviews, requesting each user at most once.
 */
export interface ReviewerLookup {
    /**
     * Loads the reviewer with the given id. Lookups of the same id share one request, also after it
     * succeeded.
     *
     * Never rejects: if the reviewer can't be loaded, the failure is logged once and the lookups
     * pending at that time resolve to `undefined`, so that the review is shown without a user. A later
     * lookup of the id requests the reviewer again.
     *
     * @param userId - The id of the reviewer
     * @returns The reviewer, or `undefined` if it couldn't be loaded
     */
    getReviewer(userId: string): Promise<User | undefined>;
}

/**
 * Creates a {@link ReviewerLookup} with its own, empty set of lookups.
 */
export function createReviewerLookup(): ReviewerLookup {
    const reviewersById = new Map<string, Promise<User | undefined>>();

    return {
        getReviewer(userId) {
            let reviewer = reviewersById.get(userId);
            if (reviewer === undefined) {
                reviewer = getUserById(userId).catch((error) => {
                    // Forget the failure, so that a later lookup retries it
                    reviewersById.delete(userId);
                    console.error(`Couldn't load reviewer ${userId}: ${error}`);
                    return undefined;
                });
                reviewersById.set(userId, reviewer);
            }
            return reviewer;
        },
    };
}
