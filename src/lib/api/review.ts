import type { Review, ReviewDecision } from "@se-uulm/snowballr-grpc-client/review";
import { client } from "#lib/api/client.js";
import { call } from "#lib/api/grpc.js";

/**
 * Creates the current user's review of a project paper.
 *
 * @param projectPaperId - The ID of the project paper
 * @param decision - The decision
 * @param selectedCriteriaIds - The IDs of the criteria the user selected, possibly none
 * @returns The created review
 */
export async function createReview(
    projectPaperId: string,
    decision: ReviewDecision,
    selectedCriteriaIds: string[],
): Promise<Review> {
    return call(() => client.createReview({ projectPaperId, decision, selectedCriteriaIds }));
}
