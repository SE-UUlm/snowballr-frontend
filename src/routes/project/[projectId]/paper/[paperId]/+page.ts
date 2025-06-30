import { backendService } from "$lib/grpc-api";
import type { Criterion } from "$lib/model/api/criterion";
import { Review } from "$lib/model/api/review";
import type { User } from "$lib/model/api/user";
import type { CriterionWithReviews } from "$lib/model/general";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const loadingProjectPaper = backendService.getProjectPaperByRelativeId({
        projectId: params.projectId,
        relativeProjectPaperId: params.paperId,
    }).response;

    const backwardReferencedPapers = loadingProjectPaper
        .then(({ paper }) => backendService.getBackwardReferencedPapers({ id: paper!.id }).response)
        .then((paperList) => paperList.papers);

    const forwardReferencedPapers = loadingProjectPaper
        .then(({ paper }) => backendService.getForwardReferencedPapers({ id: paper!.id }).response)
        .then((paperList) => paperList.papers);

    const criteriaWithReviews: Promise<CriterionWithReviews[]> = Promise.all([
        backendService.getAllCriteriaForProject({ id: params.projectId }).response,
        loadingProjectPaper.then(
            (paper) => backendService.getAllReviewsForProjectPaper({ id: paper.id }).response,
        ),
    ]).then(async ([{ criteria }, { reviews }]) => createCriteriaWithReviews(criteria, reviews));

    const reviewers: Promise<User[]> = criteriaWithReviews.then(async (criteria) => {
        const reviews = criteria.flatMap((criterion) => criterion.reviews);
        const userIds: Set<string> = new Set(reviews.map((review) => review.userId));
        const users: User[] = await Promise.all(
            Array.from(userIds)
                .map((id) => backendService.getUserById({ id }).response.catch(() => undefined))
                .filter((user) => user !== undefined) as Promise<User>[],
        );
        return users;
    });

    return {
        loadingProjectPaper,
        backwardReferencedPapers,
        forwardReferencedPapers,
        reviewers,
        criteriaWithReviews,
    };
};

/**
 * Takes a list of criteria and reviews and creates a list of criteria with reviews by attaching the reviews to the criteria.
 * The reviews are filtered by the selected criteria ids.
 *
 * @param criteria - List of criteria
 * @param reviews - List of reviews
 * @returns List of criteria with their respective reviews
 */
async function createCriteriaWithReviews(
    criteria: Criterion[],
    reviews: Review[],
): Promise<CriterionWithReviews[]> {
    const criteriaWithReviews: CriterionWithReviews[] = [];
    for (const criterion of criteria) {
        const filteredReviews = reviews.filter((review) =>
            review.selectedCriteriaIds.includes(criterion.id),
        );

        criteriaWithReviews.push({
            ...criterion,
            reviews: filteredReviews.map((review) => ({
                id: review.id,
                decision: review.decision,
                userId: review.userId,
            })),
        });
    }

    return criteriaWithReviews;
}
