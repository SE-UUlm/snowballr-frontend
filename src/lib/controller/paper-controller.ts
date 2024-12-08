import type { Paper, PaperSpec } from "$lib/model/backend";
import type { IPaperController } from "../backend-api";

export class PaperController implements IPaperController {
    private paperId: number;

    constructor(paperId: number) {
        this.paperId = paperId;
    }

    async get(): Promise<Paper> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async update(newSpec: PaperSpec): Promise<Paper> {
        throw new Error("Method not implemented.");
    }

    async getForwardReferencedPapers(): Promise<Paper[]> {
        throw new Error("Method not implemented.");
    }

    async getBackwardReferencedPapers(): Promise<Paper[]> {
        throw new Error("Method not implemented.");
    }
}
