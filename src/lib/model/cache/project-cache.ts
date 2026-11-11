import { invalidate } from "$app/navigation";
import type { Project } from "snowballr-api/project";

export const PROJECT_DEPENDENCY_KEY = "data:getProjectById";

/**
 * A project that is already known to be up to date, e.g. because it was just returned by
 * `updateProject`. It is handed to the next run of the project layout's load function exactly once,
 * so that the layout does not have to fetch the project again.
 */
let primedProject: Project | undefined = undefined;

/**
 * Takes the primed project, if it belongs to the given project id.
 * This is primarily for use by the project layout load function.
 *
 * The primed project is cleared in any case, so that later loads fetch the project again.
 *
 * @param projectId - The id of the project that is loaded
 * @returns The primed project, or undefined if there is none for the given id
 */
export function takePrimedProject(projectId: string): Project | undefined {
    const project = primedProject;
    primedProject = undefined;
    return project?.id === projectId ? project : undefined;
}

/**
 * Replaces the project loaded by the project layout with the given, already up-to-date project.
 *
 * The project is primed and the layout is invalidated, so the layout picks up the given project
 * without fetching it again.
 *
 * @param project - The up-to-date project, e.g. the one returned by `updateProject`
 */
export async function refreshProject(project: Project): Promise<void> {
    primedProject = project;
    await invalidate(PROJECT_DEPENDENCY_KEY);
}
