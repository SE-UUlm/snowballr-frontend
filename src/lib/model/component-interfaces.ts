import {
    type Project,
    type Project_Member_List,
    type Project_Paper,
    type Project_Statistics,
} from "$lib/model/api/project";
import type { Paper } from "$lib/model/api/paper";
import type { PaperStatus } from "$lib/model/general";

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
    decisions: Record<PaperStatus, number>;
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

interface ReadingListEntryInterface {
    paper: Paper;
}

export type {
    PaperListEntryInterface,
    ProjectListEntryInterface,
    ProjectInformationInterface,
    StageProgressInterface,
    ReadingListEntryInterface,
};
