import { getUserById } from "#lib/api/user.js";
import type { User } from "#lib/api/types.js";

/**
 * Looks up the users who wrote reviews, requesting each user at most once.
 */
export interface ReviewerLookup {
    /**
     * Loads the reviewer with the given id. Lookups of the same id share one request, also after it
     * settled.
     *
     * Never rejects: if the reviewer can't be loaded, the failure is logged once and every lookup of
     * the id resolves to `undefined`, so that the review is shown without a user.
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
    const lookups = new Map<string, Promise<User | undefined>>();

    return {
        getReviewer(userId) {
            let lookup = lookups.get(userId);
            if (lookup === undefined) {
                lookup = getUserById(userId).catch((error) => {
                    console.error(`Couldn't load review user with: ${userId} (error: ${error})`);
                    return undefined;
                });
                lookups.set(userId, lookup);
            }
            return lookup;
        },
    };
}
