import type { Criterion, CriterionSpec, Project, ProjectSpec, User } from "$lib/model/backend";
import type { ICriterionController, IProjectController, IStageController } from "../backend-api";
import { CriterionController } from "./criterion-controller";
import { HttpClient } from "./http-client";
import { StageController } from "./stage-controller";

export class ProjectController implements IProjectController {
    private readonly client: HttpClient;
    private readonly path: string;

    constructor(projectId: number) {
        this.path = `projects/${projectId}`;
        this.client = new HttpClient(this.path);
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
        return new StageController(this.path, stageIndex);
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
        return new CriterionController(this.path, criterionId);
    }
}
