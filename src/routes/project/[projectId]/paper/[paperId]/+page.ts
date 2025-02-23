import { backendService } from "$lib/grpc-api";
import type { Criterion } from "$lib/model/api/criterion";
import { Review } from "$lib/model/api/review";
import type { User } from "$lib/model/api/user";
import type { ReviewedCriterion } from "$lib/model/general";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const loadingProjectPaper = backendService.getProjectPaperById({ id: params.paperId }).response;

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingProjectPaper.catch(() => {});

    const backwardReferencedPapers = loadingProjectPaper
        .then(({ paper }) => backendService.getBackwardReferencedPapers({ id: paper!.id }).response)
        .then((paperList) => paperList.papers);

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    backwardReferencedPapers.catch(() => {});

    const forwardReferencedPapers = loadingProjectPaper
        .then(({ paper }) => backendService.getForwardReferencedPapers({ id: paper!.id }).response)
        .then((paperList) => paperList.papers);

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    forwardReferencedPapers.catch(() => {});

    const reviewedCriteria: Promise<ReviewedCriterion[]> = Promise.all([
        backendService.getAllCriteriaForProject({ id: params.projectId }).response,
        backendService.getAllReviewsForProjectPaper({ id: params.paperId }).response,
    ]).then(async ([{ criteria }, { reviews }]) => createReviewedCriteria(criteria, reviews));

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    reviewedCriteria.catch(() => {});

    const reviewers: Promise<User[]> = reviewedCriteria.then(async (criteria) => {
        const users: User[] = [];
        const reviews = criteria.flatMap((criterion) => criterion.reviews);
        for (const review of reviews) {
            if (!users.some((user) => user.id === review.userId)) {
                await backendService.getUserById({ id: review.userId }).response;
            }
        }
        return users;
    });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    reviewers.catch(() => {});

    return {
        loadingProjectPaper,
        backwardReferencedPapers,
        forwardReferencedPapers,
        reviewers,
        reviewedCriteria,
        isReviewMode: false,
    };
};

/**
 * Takes a list of criteria and reviews and creates a list of reviewed criteria by attaching the reviews to the criteria.
 * The reviews are filtered by the selected criteria ids.
 *
 * @param criteria - List of criteria
 * @param reviews - List of reviews
 * @returns List of reviewed criteria
 */
async function createReviewedCriteria(
    criteria: Criterion[],
    reviews: Review[],
): Promise<ReviewedCriterion[]> {
    const reviewedCriteria: ReviewedCriterion[] = [];
    for (const criterion of criteria) {
        const filteredReviews = reviews.filter((review) =>
            review.selectedCriteriaIds.includes(criterion.id),
        );

        reviewedCriteria.push({
            ...criterion,
            reviews: filteredReviews.map((review) => ({
                id: review.id,
                decision: review.decision,
                userId: review.userId,
            })),
        });
    }

    return reviewedCriteria;
}
