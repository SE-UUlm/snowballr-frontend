import { Project_Paper } from "$lib/model/api/project";
import type { Criterion } from "./api/criterion";
import type { Paper } from "./api/paper";
import type { Review } from "./api/review";

/*
Contains general types that are used in several components or pages but cannot be categorised anywhere else.
 */

type ValidationResult = { success: true } | { success: false; error: string };

interface ApiError {
    errorTitle: string;
    errorDetails?: string;
}

type PaperStatus = "Not reviewed" | "Undecided" | "Accepted" | "Declined";

/**
 * A criterion with resolved review references.
 */
type CriterionWithReviews = Criterion & {
    reviews: Omit<Review, "selectedCriteriaIds">[];
};

interface UserConfig {
    isReviewMode: boolean;
}

interface Stage {
    stageIndex: bigint;
    papers: Project_Paper[];
}

/*
Functions related to the (general) types.
 */

function isProjectPaper(paper: Project_Paper | Paper): paper is Project_Paper {
    return "paper" in paper;
}

function asPaper(paper: Project_Paper | Paper): Paper {
    return isProjectPaper(paper) ? paper.paper! : paper;
}

export type { ValidationResult, ApiError, CriterionWithReviews, UserConfig, Stage, PaperStatus };
export { asPaper };
