export enum CriterionCategory {
    Inclusion,
    Exclusion,
    HardExclusion,
}

export enum ReviewDecision {
    Declined,
    Maybe,
    Accepted,
}

export type PaperDecision = ReviewDecision.Accepted | ReviewDecision.Declined;

export interface ReviewDecisionMatrix {
    numberOfReviewers: number;
    patterns: Map<ReviewDecision[], PaperDecision>;
}

export interface User {
    id: number;
    status: string;
    isAdmin: boolean;
    firstName: string;
    lastName: string;
    email: string;
}

export type UserSpec = Omit<User, "id" | "status" | "isAdmin">;

export interface Project {
    id: number;
    name: string;
    reviewDecisionMatrix: ReviewDecisionMatrix;
    similarityThreshold: number;
    paperFetchApis: string[];
}

export type ProjectSpec = Omit<Project, "id">;

export interface ProjectMetadata {
    project: Project;
    members: User[];
    stage: number;
    stageProgress: number;
}

export interface Criterion {
    id: number;
    tag: string;
    name: string;
    description: string;
    category: CriterionCategory;
}

export type CriterionSpec = Omit<Criterion, "id">;

export interface Review {
    // TODO: exchange by userId, if userIds can be resolved properly by user controller
    user: User;
    finished: boolean;
    decision: ReviewDecision;
    selectedCriteriaIds: number[];
}

export type ReviewSpec = Omit<Review, "userId">;

// TODO: figure out purpose of this interface
export interface StageEntry {
    paper: Paper;
    stage: number;
    status: string;
    decision: PaperDecision;
}

export interface Paper {
    id: number;
    doi?: string;
    title: string;
    abstrakt?: string;
    year?: number;
    type?: string;
    authors: Author[];
    backwardReferencedPaperIds: number[];
    forwardReferencedPaperIds: number[];
    reviewData?: { finalDecision: ReviewDecision; reviews: Review[] };
}

export type PaperSpec = Omit<Paper, "id">;

export interface Author {
    id: number;
    firstName: string;
    lastName: string;
    orcid?: string;
}

export type AuthorSpec = Omit<Author, "id">;
