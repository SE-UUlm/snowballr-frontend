import { goto } from "$app/navigation";
import type { Project, Project_Paper } from "$api/project";

/**
 * Handles the navigation of the navigation button depending on the direction.
 *
 * @param direction - the direction to navigate in ("left" or "right")
 * @param loadingProjectPaper - the promise of the paper that is currently loaded
 * @param paperQueue - the queue of last-visited papers
 * @param loadingProject - the promise of the project that is currently loaded
 * @param nextProjectPaper - the next paper to be loaded (if direction is "right")
 * @param previousProjectPaper - the previous paper to be loaded (if direction is "left")
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
