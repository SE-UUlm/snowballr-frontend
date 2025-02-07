import type { LayoutLoad } from "./$types";
import { ProjectStatus } from "$lib/model/api/project";

export const load: LayoutLoad = async ({ params }) => {
    const projectId = Number(params.projectId);
    if (Number.isNaN(projectId)) {
        throw new Error(`Invalid projectId ${params.projectId}`);
    }
    return {
        project: {
            id: "0",
            name: "Demo Project",
            status: ProjectStatus.ACTIVE,
            currentStage: 0n,
            maxStage: 1n,
            settings: undefined,
        },
    };
};
