import type {
    Author,
    AuthorSpec,
    Criterion,
    CriterionSpec,
    Paper,
    PaperSpec,
    Project,
    ProjectSpec,
    Review,
    ReviewSpec,
    StageEntry,
    User,
    UserSpec,
} from "./model/backend";

export interface IUserController {
    get(): Promise<User>;
    block(): Promise<void>;
    changePassword(newPassword: string): Promise<void>;
    update(newSpec: UserSpec): Promise<User>;

    getProjects(): Promise<Project[]>;
    getReadingList(): Promise<Paper[]>;
    addToReadingList(paperId: number): Promise<void>;
    removeFromReadingList(paperId: number): Promise<void>;
}

export interface IReviewController {
    get(): Promise<Review>;
    set(spec: ReviewSpec): Promise<void>;
    remove(): Promise<void>;
}

export interface IPaperController {
    get(): Promise<Paper>;
    update(newSpec: PaperSpec): Promise<Paper>;

    getForwardReferencedPapers(): Promise<Paper[]>;
    getBackwardReferencedPapers(): Promise<Paper[]>;
}

export interface IStageEntryController {
    get(): Promise<StageEntry>;
    remove(): Promise<void>;

    getReviews(): Promise<Review[]>;
    addReview(spec: ReviewSpec): Promise<Review>;
    review(userId: number): IReviewController;
}

export interface IStageController {
    getAllPapersAsCsv(): Promise<Blob>;

    getPapers(): Promise<StageEntry[]>;
    addPaper(paperId: number): Promise<StageEntry>;
    paper(paperId: number): IStageEntryController;
}

export interface ICriterionController {
    get(): Promise<Criterion>;
    remove(): Promise<void>;
    update(spec: CriterionSpec): Promise<Criterion>;
}

export interface IProjectController {
    get(): Promise<Project>;
    update(newSpec: ProjectSpec): Promise<Project>;

    archive(): Promise<void>;
    getReplicationPackageAsZip(): Promise<Blob>;
    getAllPapersAsCsv(): Promise<Blob>;

    getStageCount(): number;
    stage(stageIndex: number): IStageController;

    getMembers(): Promise<User[]>;
    inviteUser(email: string): Promise<void>;
    removeMember(userId: number): Promise<void>;

    getCriteria(): Promise<Criterion[]>;
    createCriterion(spec: CriterionSpec): Promise<void>;
    criterion(criterionId: number): ICriterionController;
}

export interface IAuthorController {
    get(): Promise<Author>;
    update(newSpec: AuthorSpec): Promise<Author>;
    remove(): Promise<void>;
}

export interface IBackendController {
    login(username: string, password: string): Promise<User>;
    logout(): Promise<void>;
    requestEmailForgottenPassword(email: string): Promise<void>;

    getProjects(): Promise<Project[]>;
    createProject(spec: ProjectSpec): Promise<Project>;
    project(projectId: number): IProjectController;

    getUsers(): Promise<User[]>;
    createUser(personalInfo: UserSpec, password: string): Promise<User>;
    user(userId: number): IUserController;
    thisUser(): IUserController;

    getAuthors(): Promise<Author[]>;
    createAuthor(spec: AuthorSpec): Promise<Author>;
    author(authorId: number): IAuthorController;

    getPapers(): Promise<Paper[]>;
    createPaper(spec: PaperSpec): Promise<Paper>;
    paper(paperId: number): IPaperController;
}
