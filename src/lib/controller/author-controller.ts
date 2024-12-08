import type { Author, AuthorSpec } from "$lib/model/backend";
import type { IAuthorController } from "../backend-api";

export class AuthorController implements IAuthorController {
    private authorId: number;

    constructor(authorId: number) {
        this.authorId = authorId;
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
