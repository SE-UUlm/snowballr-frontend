import type { Criterion, CriterionSpec } from "$lib/model/backend";
import type { ICriterionController } from "../backend-api";

export class CriterionController implements ICriterionController {
    private projectId: number;
    private criterionId: number;

    constructor(projectId: number, criterionId: number) {
        this.projectId = projectId;
        this.criterionId = criterionId;
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
