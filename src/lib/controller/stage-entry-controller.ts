import type { StageEntry, Review, ReviewSpec } from "$lib/model/backend";
import type { IReviewController, IStageEntryController } from "../backend-api";
import { HttpClient } from "./http-client";
import { ReviewController } from "./review-controller";

export class StageEntryController implements IStageEntryController {
    private readonly client: HttpClient;
    private readonly path: string;

    constructor(basePath: string, paperId: number) {
        this.path = `${basePath}/papers/${paperId}`;
        this.client = new HttpClient(this.path);
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
        return new ReviewController(this.path, reviewerId);
    }
}
