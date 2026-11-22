import { describe, expect, test } from "vitest";
import { ReviewDecision } from "snowballr-api/review";
import { ApiError } from "$lib/api/errors";
import { createReview } from "$lib/api/review";
import { createReview as buildReview } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("createReview", () => {
    test("When a review is created, then the project paper, the decision and the criteria are sent", async () => {
        const review = buildReview({ id: "r1", decision: ReviewDecision.ACCEPTED });
        const createReviewCall = mockApiCall("createReview", review);

        await expect(createReview("pp-1", ReviewDecision.ACCEPTED, ["c1", "c2"])).resolves.toEqual(
            review,
        );
        expect(createReviewCall).toHaveBeenCalledExactlyOnceWith({
            projectPaperId: "pp-1",
            decision: ReviewDecision.ACCEPTED,
            selectedCriteriaIds: ["c1", "c2"],
        });
    });

    test("When creating the review fails, then it rejects with an ApiError", async () => {
        mockFailedApiCall("createReview", "backend down");

        await expect(createReview("pp-1", ReviewDecision.DECLINED, [])).rejects.toBeInstanceOf(
            ApiError,
        );
    });
});
