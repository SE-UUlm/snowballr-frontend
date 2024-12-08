import type { StageEntry } from "$lib/model/backend";
import type { IStageController, IStageEntryController } from "../backend-api";
import { StageEntryController } from "./stage-entry-controller";

export class StageController implements IStageController {
    private projectId: number;
    private stageIndex: number;

    constructor(projectId: number, stageIndex: number) {
        this.projectId = projectId;
        this.stageIndex = stageIndex;
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
        return new StageEntryController(this.projectId, this.stageIndex, paperId);
    }
}
