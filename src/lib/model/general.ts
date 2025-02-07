import type {
    Project,
    Project_Member_List,
    Project_Paper,
    Project_Statistics,
} from "$lib/model/api/project";

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

interface PaperListEntryInterface {
    projectPaper: Project_Paper;
    projectId: string;
    showReviewStatus?: boolean;
}

export type { ValidationResult, ApiError, ProjectListEntryInterface, PaperListEntryInterface };
