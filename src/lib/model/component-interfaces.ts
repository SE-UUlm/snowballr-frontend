import {
    type Project,
    type Project_Member_List,
    type Project_Paper,
    type Project_Information,
    type Project_Information_DecisionStatistics,
} from "$lib/model/api/project";
import type { Paper } from "$lib/model/api/paper";

/**
 * Contains interfaces or types that specify the interface of components.
 * These are not defined locally so that these types can be used at the point where the data for the components is loaded or created too.
 */

interface ProjectInformationInterface {
    projectName: string;
    projectStart: Date;
    projectStage: bigint;
    daysInStage: number;
    estimatedRemainingDays: number;
    totalPapersInStage: number;
    reviewedPapersInStage: number;
}

interface StageProgressInterface {
    stage: bigint;
    decisions: Project_Information_DecisionStatistics;
}

interface ProjectListEntryInterface {
    project: Project;
    membersList: Project_Member_List;
    information: Project_Information;
}

/**
 * Interface for the paper list entries.
 *
 * It either takes a Paper or a Project_Paper object.
 * According to this the projectId is either undefined or a string.
 */
type PaperListEntryInterface =
    | {
          projectId: undefined;
          paper: Paper;
      }
    | {
          projectId: string;
          paper: Project_Paper;
      };

export type {
    PaperListEntryInterface,
    ProjectListEntryInterface,
    ProjectInformationInterface,
    StageProgressInterface,
};
