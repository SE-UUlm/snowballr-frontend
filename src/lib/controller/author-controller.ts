import type { Author, AuthorSpec } from "$lib/model/backend";
import type { IAuthorController } from "../backend-api";
import { HttpClient } from "./http-client";

export class AuthorController implements IAuthorController {
    private readonly client: HttpClient;

    constructor(authorId: number) {
        this.client = new HttpClient(`authors/${authorId}`);
    }

    async get(): Promise<Author> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async update(newSpec: AuthorSpec): Promise<Author> {
        throw new Error("Method not implemented.");
    }

    async remove(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
