import type { StageEntry, Review, ReviewSpec } from "$lib/model/backend";
import type { IReviewController, IStageEntryController } from "../backend-api";
import { ReviewController } from "./review-controller";

export class StageEntryController implements IStageEntryController {
    private projectId: number;
    private stageIndex: number;
    private paperId: number;

    constructor(projectId: number, stageIndex: number, paperId: number) {
        this.projectId = projectId;
        this.stageIndex = stageIndex;
        this.paperId = paperId;
    }

    async get(): Promise<StageEntry> {
        throw new Error("Method not implemented.");
    }

    async remove(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async getReviews(): Promise<Review[]> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async addReview(spec: ReviewSpec): Promise<Review> {
        throw new Error("Method not implemented.");
    }

    review(reviewerId: number): IReviewController {
        return new ReviewController(this.projectId, this.stageIndex, this.paperId, reviewerId);
    }
}
