import { listCriteria } from "$lib/api/criterion";
import { getBackwardReferencedPapers, getForwardReferencedPapers } from "$lib/api/paper";
import { getProjectPaperByLocalId } from "$lib/api/project-paper";
import { getUserById } from "$lib/api/user";
import { type Criterion, Review, type User } from "$lib/api/types";
import type { CriterionWithReviews } from "$lib/model/general";
import type { PageLoad } from "./$types";
import { getUserById } from "$lib/api/user";

export const load: PageLoad = ({ params }) => {
    const loadingProjectPaper = getProjectPaperByLocalId(params.projectId, params.paperId);

    const backwardReferencedPapers = loadingProjectPaper.then(({ paper }) =>
        getBackwardReferencedPapers(paper!.id),
    );

    const forwardReferencedPapers = loadingProjectPaper.then(({ paper }) =>
        getForwardReferencedPapers(paper!.id),
    );

    const criteriaWithReviews: Promise<CriterionWithReviews[]> = Promise.all([
        listCriteria(params.projectId),
        loadingProjectPaper.then((paper) => paper.reviews),
    ]).then(async ([criteria, reviews]) => createCriteriaWithReviews(criteria, reviews));

    const reviewers: Promise<User[]> = criteriaWithReviews.then(async (criteria) => {
        const reviews = criteria.flatMap((criterion) => criterion.reviews);
        const userIds: Set<string> = new Set(reviews.map((review) => review.userId));
        const users: User[] = await Promise.all(
            Array.from(userIds)
                .map((id) => getUserById(id).catch(() => undefined))
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
