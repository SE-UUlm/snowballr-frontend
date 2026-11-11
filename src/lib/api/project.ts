import type { PartialMessage } from "@protobuf-ts/runtime";
import type { FetcherOptions } from "snowballr-api/fetcher";
import {
    Project,
    Project_Settings,
    type Project_Information,
    type Project_Information_DecisionStatistics,
    type Project_Update,
    type ProjectStatus,
} from "snowballr-api/project";
import { client } from "./client";
import { buildFieldMask } from "./fieldmask";
import { call } from "./grpc";

/**
 * A sparse patch of a project's settings: only the fields to change, nested as in the settings,
 * for example `{ decisionMatrix: { numberOfReviewers: 3 } }`.
 *
 * **Write it as a plain object.** Don't build it with `Project_Settings.create()` or any other
 * generated `create()`: they fill in every field, so the mask derived from the patch would cover
 * all sibling settings and reset them to their defaults.
 */
export type ProjectSettingsPatch = PartialMessage<Project_Settings>;

/**
 * Loads a project.
 *
 * @param projectId - The ID of the project
 * @returns The project
 */
export async function getProject(projectId: string): Promise<Project> {
    return call(client.getProjectById({ id: projectId }));
}

/**
 * Loads the active projects that a user is a member of. Projects the user is only invited to are
 * left out.
 *
 * @param userId - The ID of the user
 * @returns The active projects of the user
 */
export async function listProjectsForUser(userId: string): Promise<Project[]> {
    const { projects } = await call(client.getAllProjectsForUser({ id: userId }));
    return projects;
}

/**
 * Loads the archived projects that a user is a member of.
 *
 * @param userId - The ID of the user
 * @returns The archived projects of the user
 */
export async function listArchivedProjectsForUser(userId: string): Promise<Project[]> {
    const { projects } = await call(client.getAllArchivedProjectsForUser({ id: userId }));
    return projects;
}

/**
 * Loads the information about a project's progress, such as its creation date and the start of
 * its current stage.
 *
 * @param projectId - The ID of the project
 * @returns The project information
 */
export async function getProjectInformation(projectId: string): Promise<Project_Information> {
    return call(client.getProjectInformation({ projectId }));
}

/**
 * Loads how many papers of a stage have each decision.
 *
 * @param projectId - The ID of the project
 * @param stage - The stage
 * @returns The decision statistics of the stage
 */
export async function getDecisionStatisticsForStage(
    projectId: string,
    stage: bigint,
): Promise<Project_Information_DecisionStatistics> {
    return call(client.getDecisionStatisticsForStage({ projectId, stage }));
}

/**
 * Creates a project.
 *
 * @param name - The name of the project
 * @returns The created project
 */
export async function createProject(name: string): Promise<Project> {
    return call(client.createProject({ name }));
}

/**
 * Deletes a project. The backend only marks it as deleted, so it can be restored later.
 *
 * @param projectId - The ID of the project
 */
export async function deleteProject(projectId: string): Promise<void> {
    await call(client.softDeleteProject({ id: projectId }));
}

/**
 * Builds the request that updates only the fields in `patch`.
 *
 * The mask is derived from the plain patch, so it names exactly the changed fields. Only then the
 * patch becomes a `Project` message, because `create()` fills in every field. The project ID
 * identifies the project and stays out of the mask.
 */
function buildProjectUpdate(projectId: string, patch: PartialMessage<Project>): Project_Update {
    const sparsePatch: PartialMessage<Project> = { id: projectId, ...patch };
    return {
        project: Project.create(sparsePatch),
        mask: buildFieldMask(sparsePatch, "project"),
    };
}

/**
 * Renames a project.
 *
 * @param projectId - The ID of the project
 * @param name - The new name
 * @returns The updated project
 */
export async function renameProject(projectId: string, name: string): Promise<Project> {
    return call(client.updateProject(buildProjectUpdate(projectId, { name })));
}

/**
 * Sets the status of a project, for example to archive it or to activate it again.
 *
 * @param projectId - The ID of the project
 * @param status - The new status
 * @returns The updated project
 */
export async function setProjectStatus(projectId: string, status: ProjectStatus): Promise<Project> {
    return call(client.updateProject(buildProjectUpdate(projectId, { status })));
}

/**
 * Sets the fetchers that a project uses to find papers.
 *
 * @param projectId - The ID of the project
 * @param fetchers - The options of each fetcher, keyed by fetcher ID
 * @returns The updated project
 */
export async function setProjectFetchers(
    projectId: string,
    fetchers: Record<string, FetcherOptions>,
): Promise<Project> {
    return call(
        client.updateProject({
            project: Project.create({
                id: projectId,
                settings: Project_Settings.create({ fetchers }),
            }),
            // buildFieldMask doesn't detect that the fetchers map is set, so the path is written
            // by hand.
            mask: { paths: ["project.settings.fetchers"] },
        }),
    );
}

/**
 * Updates the settings of a project that `patch` names and leaves all others as they are.
 *
 * @param projectId - The ID of the project
 * @param patch - The settings to change
 * @returns The updated project
 */
export async function updateProjectSettings(
    projectId: string,
    patch: ProjectSettingsPatch,
): Promise<Project> {
    return call(client.updateProject(buildProjectUpdate(projectId, { settings: patch })));
}

/**
 * Creates a project with every field at its default, without a backend call. It stands in for a
 * project that hasn't loaded yet, for example to read the default of a setting.
 *
 * @returns The empty project
 */
export function emptyProject(): Project {
    return Project.create();
}
