import type {
    IAuthorController,
    IBackendController,
    IPaperController,
    IProjectController,
    IUserController,
} from "../backend-api";
import type {
    User,
    Project,
    ProjectSpec,
    UserSpec,
    Author,
    AuthorSpec,
    Paper,
    PaperSpec,
} from "../model/backend";
import { AuthorController } from "./author-controller";
import { HttpClient } from "./http-client";
import { PaperController } from "./paper-controller";
import { ProjectController } from "./project-controller";
import { UserController } from "./user-controller";

export class BackendController implements IBackendController {
    private static readonly instance: BackendController = new BackendController();
    private readonly client: HttpClient;

    private constructor() {
        this.client = new HttpClient();
    }

    static getInstance() {
        return BackendController.instance;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn(email: string, password: string): Promise<User> {
        throw new Error("Method not implemented.");
    }

    async signOut(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async requestEmailForgottenPassword(email: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async getProjects(): Promise<Project[]> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createProject(spec: ProjectSpec): Promise<Project> {
        throw new Error("Method not implemented.");
    }

    project(projectId: number): IProjectController {
        return new ProjectController(projectId);
    }

    async getUsers(): Promise<User[]> {
        throw new Error("Method not implemented.");
    }

    async createUser(personalInfo: UserSpec, password: string): Promise<User> {
        const payload = {
            email: personalInfo.email,
            sender: {
                firstName: personalInfo.firstName,
                lastName: personalInfo.lastName,
                password: password,
            },
        };

        return this.client.post("users", payload).then((response) => response.json());
    }

    user(userId: number): IUserController {
        return new UserController(userId);
    }

    thisUser(): IUserController {
        throw new Error("Method not implemented.");
    }

    async getAuthors(): Promise<Author[]> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createAuthor(spec: AuthorSpec): Promise<Author> {
        throw new Error("Method not implemented.");
    }

    author(authorId: number): IAuthorController {
        return new AuthorController(authorId);
    }

    async getPapers(): Promise<Paper[]> {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createPaper(spec: PaperSpec): Promise<Paper> {
        throw new Error("Method not implemented.");
    }

    paper(paperId: number): IPaperController {
        return new PaperController(paperId);
    }
}
