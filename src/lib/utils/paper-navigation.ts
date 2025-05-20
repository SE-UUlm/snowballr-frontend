import { goto } from "$app/navigation";
import type { Project, Project_Paper } from "$lib/model/api/project";

/**
 * Handles the navigation of the button with the direction "right". Therefore, it is checked whether the
 * review mode is activated or not.
 */
export const navigatePaper = async function (
    direction: "left" | "right",
    loadingProjectPaper: Promise<Project_Paper | undefined>,
    paperQueue: Project_Paper[],
    loadingProject?: Promise<Project>,
    nextProjectPaper?: Project_Paper,
    previousProjectPaper?: Project_Paper,
) {
    if (!loadingProject) return;
    const project = await loadingProject;
    if (direction === "right" && nextProjectPaper) {
        const paper = await loadingProjectPaper;
        if (paper) paperQueue.push(paper);
        await goto(`/project/${project.id}/paper/${nextProjectPaper.localId}`);
    }
    if (direction === "left" && previousProjectPaper) {
        paperQueue.pop();
        await goto(`/project/${project.id}/paper/${previousProjectPaper.localId}`);
    }
};
