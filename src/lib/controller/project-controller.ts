import type { Criterion, CriterionSpec, Project, ProjectSpec, User } from "$lib/model/backend";
import type { ICriterionController, IProjectController, IStageController } from "../backend-api";
import { CriterionController } from "./criterion-controller";
import { StageController } from "./stage-controller";

export class ProjectController implements IProjectController {
    private projectId: number;

    constructor(projectId: number) {
        this.projectId = projectId;
    }

    async get(): Promise<Project> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async update(newSpec: ProjectSpec): Promise<Project> {
        throw new Error("Method not implemented.");
    }

    async archive(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async getReplicationPackageAsZip(): Promise<Blob> {
        throw new Error("Method not implemented.");
    }

    async getAllPapersAsCsv(): Promise<Blob> {
        throw new Error("Method not implemented.");
    }

    async getStageCount(): Promise<number> {
        throw new Error("Method not implemented.");
    }

    stage(stageIndex: number): IStageController {
        return new StageController(this.projectId, stageIndex);
    }

    async getMembers(): Promise<User[]> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async inviteUser(email: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async removeMember(userId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async getCriteria(): Promise<Criterion[]> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createCriterion(spec: CriterionSpec): Promise<void> {
        throw new Error("Method not implemented.");
    }

    criterion(criterionId: number): ICriterionController {
        return new CriterionController(this.projectId, criterionId);
    }
}
