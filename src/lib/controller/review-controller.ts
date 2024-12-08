import type { Review, ReviewSpec } from "$lib/model/backend";
import type { IReviewController } from "../backend-api";

export class ReviewController implements IReviewController {
    private projectId: number;
    private stageIndex: number;
    private paperId: number;
    private reviewerId: number;

    constructor(projectId: number, stageIndex: number, paperId: number, reviewerId: number) {
        this.projectId = projectId;
        this.stageIndex = stageIndex;
        this.paperId = paperId;
        this.reviewerId = reviewerId;
    }

    async get(): Promise<Review> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async set(spec: ReviewSpec): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async remove(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
