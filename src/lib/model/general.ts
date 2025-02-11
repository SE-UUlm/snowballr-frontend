import {
    Project_Paper,
    type Project,
    type Project_Member_List,
    type Project_Statistics,
} from "$lib/model/api/project";
import type { Criterion } from "./api/criterion";
import type { Paper } from "./api/paper";
import type { Review } from "./api/review";

type ValidationResult = { success: true } | { success: false; error: string };

interface ApiError {
    errorTitle: string;
    errorDetails?: string;
}

interface ProjectListEntryInterface {
    project: Project;
    membersList: Project_Member_List;
    statistics: Project_Statistics;
}

/**
 * Interface for the paper list entries.
 *
 * It either takes a Paper or a Project_Paper object.
 * According to this the projectId is either undefined or a string
 * and the showReviewStatus is either false or a boolean value.
 */
type PaperListEntryInterface =
    | {
          projectId: undefined;
          paper: Paper;
          showReviewStatus: false;
      }
    | {
          projectId: string;
          paper: Project_Paper;
          showReviewStatus: boolean;
      };

function isProjectPaper(paper: Project_Paper | Paper): paper is Project_Paper {
    return "paper" in paper;
}

function asPaper(paper: Project_Paper | Paper): Paper {
    return isProjectPaper(paper) ? paper.paper! : paper;
}

/**
 * A review with resolved criterion references.
 */
type ReviewedCriterion = Criterion & {
    reviews: Omit<Review, "selectedCriteriaIds">[];
};

export type {
    ValidationResult,
    ApiError,
    ProjectListEntryInterface,
    PaperListEntryInterface,
    ReviewedCriterion,
};
export { asPaper };
