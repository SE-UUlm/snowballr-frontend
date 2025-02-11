import type {
    Project,
    Project_Member_List,
    Project_Paper,
    Project_Statistics,
} from "$lib/model/api/project";
import type { Paper } from "./api/paper";

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

export type { ValidationResult, ApiError, ProjectListEntryInterface, PaperListEntryInterface };
export { isProjectPaper };
