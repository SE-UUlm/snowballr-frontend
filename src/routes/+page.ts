import type { PageLoad } from "./$types";
import type { Project, UserSpec } from "$lib/model/backend";

export const load: PageLoad = async () => {
    const project: Project = {
        id: 1,
        name: "Demo Project",
        reviewDecisionMatrix: { numberOfReviewers: 3, patterns: new Map() },
        similarityThreshold: 0.7,
        paperFetchApis: [],
    };
    const members: UserSpec[] = [
        { firstName: "Felix", lastName: "Schlegel", email: "" },
        { firstName: "Luca", lastName: "Schlecker", email: "" },
        { firstName: "Leonhard", lastName: "Alkewitz", email: "" },
    ];
    const stage = 3;
    const projectProgress = 70;

    return { project, members, stage, projectProgress };
};
