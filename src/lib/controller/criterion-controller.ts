import type { Criterion, CriterionSpec } from "$lib/model/backend";
import type { ICriterionController } from "../backend-api";
import { HttpClient } from "./http-client";

export class CriterionController implements ICriterionController {
    private client: HttpClient;

    constructor(basePath: string, criterionId: number) {
        this.client = new HttpClient(`${basePath}/criteria/${criterionId}`);
    }

    async get(): Promise<Criterion> {
        throw new Error("Method not implemented.");
    }

    async remove(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async update(spec: CriterionSpec): Promise<Criterion> {
        throw new Error("Method not implemented.");
    }
}
