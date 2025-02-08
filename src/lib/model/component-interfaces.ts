/*
Contains interfaces or types that specify the interface of components.
These are not defined locally so that these types can be used at the point where the data for the components is loaded or created too.
 */

export interface ProjectInformationInterface {
    projectName: string;
    projectStart: Date;
    projectStage: bigint;
    daysInStage: number;
    estimatedRemainingDays: number;
    totalPapersInStage: number;
    reviewedPapersInStage: number;
}
