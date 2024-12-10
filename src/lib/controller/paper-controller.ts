import type { Paper, PaperSpec } from "$lib/model/backend";
import type { IPaperController } from "../backend-api";
import { HttpClient } from "./http-client";

export class PaperController implements IPaperController {
    private readonly client: HttpClient;

    constructor(paperId: number) {
        this.client = new HttpClient(`papers/${paperId}`);
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
