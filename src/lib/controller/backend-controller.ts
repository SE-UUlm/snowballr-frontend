import { jwtDecode } from "jwt-decode";
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
    SignInResponse,
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

    async signIn(email: string, password: string): Promise<void> {
        const payload = {
            email: email,
            password: password,
        };
        // TODO: Omit trailing slash, when backend doesn't hardcode unauthorized routes anymore
        const response: SignInResponse = await this.client
            .post("login/", payload)
            .then((response) => response.json());
        localStorage.setItem("token", response.token);
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
        const jwt = localStorage.getItem("token");
        if (!jwt) {
            throw new Error("No JWT stored in the local storage");
        }

        const user = jwtDecode(jwt) as User;
        return new UserController(user.id);
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
