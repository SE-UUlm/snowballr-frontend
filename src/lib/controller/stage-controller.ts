import type { StageEntry } from "$lib/model/backend";
import type { IStageController, IStageEntryController } from "../backend-api";
import { HttpClient } from "./http-client";
import { StageEntryController } from "./stage-entry-controller";

export class StageController implements IStageController {
    private readonly client: HttpClient;
    private readonly path: string;

    constructor(basePath: string, stageIndex: number) {
        this.path = `${basePath}/stages/${stageIndex}`;
        this.client = new HttpClient(this.path);
    }

    async getAllPapersAsCsv(): Promise<Blob> {
        throw new Error("Method not implemented.");
    }

    async getPapers(): Promise<StageEntry[]> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async addPaper(paperId: number): Promise<StageEntry> {
        throw new Error("Method not implemented.");
    }

    paper(paperId: number): IStageEntryController {
        return new StageEntryController(this.path, paperId);
    }
}
