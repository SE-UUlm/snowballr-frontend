import type { Project } from "snowballr-api/project";
import { createPrimedCache } from "$lib/model/cache/primed-cache";

export const PROJECT_DEPENDENCY_KEY = "data:getProjectById";

const projectCache = createPrimedCache<Project>(PROJECT_DEPENDENCY_KEY);

/**
 * Takes the primed project, if it belongs to the given project id.
 * This is primarily for use by the project layout load function.
 *
 * @see PrimedCache.take
 */
export function takePrimedProject(projectId: string): Project | undefined {
    return projectCache.take(projectId);
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
