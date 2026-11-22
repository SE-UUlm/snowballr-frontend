import type { Project } from "#lib/api/types.js";
import { createPrimedCache, type ProjectLoadEvent } from "#lib/model/cache/primed-cache.js";

const projectCache = createPrimedCache<Project>("data:getProjectById");

/**
 * Loads the project for the project layout load function: the primed project, if there is one, and
 * the fetched project otherwise.
 *
 * @param event - The event of the project layout load function
 * @param fetchProject - Fetches the project with the given id, if none is primed for it
 * @see PrimedCache.load
 */
export function loadPrimedProject(
    event: ProjectLoadEvent,
    fetchProject: (projectId: string) => Promise<Project>,
): Promise<Project> {
    return projectCache.load(event, fetchProject);
}

/**
 * Replaces the project loaded by the project layout with the given, already up-to-date project,
 * without fetching it again.
 *
 * @param project - The up-to-date project, e.g. the one returned by `updateProject`
 * @see PrimedCache.refresh
 */
export function refreshProject(project: Project): Promise<void> {
    return projectCache.refresh(project.id, project);
}
