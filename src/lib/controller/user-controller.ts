import type { User, UserSpec, Project, Paper } from "$lib/model/backend";
import type { IUserController } from "../backend-api";
import { HttpClient } from "./http-client";

export class UserController implements IUserController {
    private readonly client: HttpClient;

    constructor(userId: number) {
        this.client = new HttpClient(`users/${userId}`);
    }

    async get(): Promise<User> {
        throw new Error("Method not implemented.");
    }

    async block(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async changePassword(newPassword: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async update(newSpec: UserSpec): Promise<User> {
        throw new Error("Method not implemented.");
    }

    async getProjects(): Promise<Project[]> {
        const response = await this.client.get("projects");
        try {
            const projects: Project[] = await response.json();
            return Promise.resolve(projects);
        } catch (error: unknown) {
            return Promise.reject(error);
        }
    }

    async getArchivedProjects(): Promise<Project[]> {
        const response = await this.client.get("archivedProjects");
        try {
            const projects: Project[] = await response.json();
            return Promise.resolve(projects);
        } catch (error: unknown) {
            return Promise.reject(error);
        }
    }

    async getAllProjects(): Promise<Project[]> {
        try {
            const activeProjects = await this.getProjects();
            const archivedProjects = await this.getArchivedProjects();

            return Promise.resolve(activeProjects.concat(archivedProjects));
        } catch (error: unknown) {
            return Promise.reject(error);
        }
    }

    async getReadingList(): Promise<Paper[]> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async addToReadingList(paperId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async removeFromReadingList(paperId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
