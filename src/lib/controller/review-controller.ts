import type { Review, ReviewSpec } from "$lib/model/backend";
import type { IReviewController } from "../backend-api";
import { HttpClient } from "./http-client";

export class ReviewController implements IReviewController {
    private client: HttpClient;

    constructor(basePath: string, reviewerId: number) {
        this.client = new HttpClient(`${basePath}/reviews/${reviewerId}`);
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
