import { Project_Paper } from "$api/project";
import type { Criterion } from "$api/criterion";
import type { Paper, Paper_ExternalId } from "$api/paper";
import type { Review } from "$api/review";

/**
 * Contains general types that are used in several components or pages but cannot be categorized anywhere else.
 */

type ValidationResult = { success: true } | { success: false; error: string };

type PaperStatus = "Not reviewed" | "Undecided" | "Accepted" | "Declined";

/**
 * A criterion with resolved review references.
 */
type CriterionWithReviews = Criterion & {
    reviews: Omit<Review, "selectedCriteriaIds">[];
};

type CriteriaList = {
    criteria: string[];
};

interface Stage {
    stageIndex: bigint;
    papers: Project_Paper[];
}

/**
 * Where a newly created paper should be filed.
 *
 * Creating a paper takes two steps - create the paper, then add it to a project stage - and only
 * the route knows the destination of the second one. Passing it down as a prop keeps that knowledge
 * with the caller that already has it, rather than having the component recover it from the address
 * bar (see #704).
 */
interface PaperCreationTarget {
    projectId: string;
    stage: bigint;
}

interface ProjectPaperFilter {
    stages: string[];
    reviewers: string[];
    publishers: string[];
    years: string[];
    decisions: string[];
    criteria: string[];
}

interface Person {
    firstName: string;
    lastName: string;
}

type PersonWithEmail = Person & {
    email: string;
};

/**
 * Version of `Paper` where every field is turned into a string for editing purposes, except for
 * `externalIds`, which is kept as-is since it is a list of type/value pairs rather than a single value.
 */
type StringifiedPaper = Omit<{ [K in keyof Paper]: string }, "externalIds"> & {
    externalIds: Paper_ExternalId[];
};

export type {
    ValidationResult,
    CriterionWithReviews,
    CriteriaList,
    Stage,
    PaperCreationTarget,
    PaperStatus,
    ProjectPaperFilter,
    Person,
    PersonWithEmail,
    StringifiedPaper,
};
