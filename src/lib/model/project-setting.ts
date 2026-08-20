import { Project } from "$api/project";
import type { FieldMask } from "$api/google/protobuf/field_mask";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { backendService } from "$lib/grpc-api";
import { buildFieldMask } from "$lib/utils/fieldmask-helper";
import { createActionError, type ActionError } from "$lib/model/action-error";
import { toast } from "svelte-sonner";

/** The success message shown after a project setting was updated, unless the descriptor overrides it. */
export const PROJECT_SETTING_SUCCESS_MESSAGE = "Successfully updated the project settings.";

/**
 * Describes a single project setting, i.e. one field of a project's configuration.
 *
 * A descriptor says how to read the setting off a {@link Project} and how to turn a new value into a
 * patch. Everything else - deriving the field mask, building the request message, persisting,
 * toasting and error mapping - is owned by this module.
 *
 * **The patch returned by {@link ProjectSettingDescriptor.toPatch} must be a plain, sparse object.**
 * Do not call `Project_Settings.create()` (or any other generated `create()`) inside it: those
 * constructors eagerly initialize *every* non-optional field, so the derived mask would cover all
 * sibling settings and reset them to their defaults. The `create()` call belongs at the wire edge
 * and is done by {@link buildProjectSettingUpdate}.
 */
export interface ProjectSettingDescriptor<T> {
    /**
     * Reads the current value of the setting from a project.
     *
     * This is also the single source of the setting's default: it is applied to an empty project to
     * determine the value shown while the real project is still loading.
     */
    read: (project: Project) => T;
    /** Turns a new value into a sparse patch of the project. Must not use generated `create()` functions. */
    toPatch: (value: T) => PartialMessage<Project>;
    /** Description of the action, used in the error details, e.g. "updating the similarity threshold". */
    action: string;
    /** Overrides {@link PROJECT_SETTING_SUCCESS_MESSAGE} for this setting. */
    successMessage?: string;
}

/** A masked update request for a single project setting. */
export interface ProjectSettingUpdate {
    project: Project;
    mask: FieldMask;
}

/**
 * The result of reading a project setting from a loading project.
 *
 * Tagged with `loaded` rather than discriminated on `error`, because {@link ActionError} itself
 * includes `undefined` and would therefore not narrow.
 */
export type ProjectSettingLoad<T> =
    | { loaded: true; value: T }
    | { loaded: false; error: ActionError };

/**
 * Builds the masked update request for a single project setting.
 *
 * The patch is assembled as a plain object so that the field mask derived from it names exactly the
 * field being changed. Only afterwards is it converted into a `Project` message. The project id is
 * added here and is kept out of the mask by {@link buildFieldMask}'s default exclusions.
 *
 * @param descriptor - The setting to update
 * @param value - The new value of the setting
 * @param projectId - The id of the project whose setting is updated
 * @returns The project message to send and the field mask naming the changed field
 */
export function buildProjectSettingUpdate<T>(
    descriptor: ProjectSettingDescriptor<T>,
    value: T,
    projectId: string,
): ProjectSettingUpdate {
    const patch: PartialMessage<Project> = { id: projectId, ...descriptor.toPatch(value) };

    return {
        project: Project.create(patch),
        mask: buildFieldMask(patch, "project"),
    };
}

/**
 * Reads the current value of a setting once the project has loaded.
 *
 * @param descriptor - The setting to read
 * @param loadingProject - The promise of the project the setting belongs to
 * @returns The value of the setting, or an {@link ActionError} if the project could not be loaded
 */
export async function loadProjectSetting<T>(
    descriptor: ProjectSettingDescriptor<T>,
    loadingProject: Promise<Project>,
): Promise<ProjectSettingLoad<T>> {
    try {
        return { loaded: true, value: descriptor.read(await loadingProject) };
    } catch (error) {
        return {
            loaded: false,
            error: createActionError(
                "Failed to Load Project Settings",
                { action: "loading the project settings" },
                error as Error,
            ),
        };
    }
}

/**
 * Persists a new value for a single project setting.
 *
 * On success a toast is shown (unless disabled via `options.toastSuccess`). Failures are *returned*
 * as an {@link ActionError} rather than toasted, so that the caller can render them with
 * `ActionErrorAlert`.
 *
 * @param descriptor - The setting to update
 * @param value - The new value of the setting
 * @param projectId - The id of the project whose setting is updated
 * @param options - Options for the update, currently only whether to toast on success
 * @returns `undefined` on success, otherwise the {@link ActionError} describing the failure
 */
export async function commitProjectSetting<T>(
    descriptor: ProjectSettingDescriptor<T>,
    value: T,
    projectId: string,
    options: { toastSuccess?: boolean } = {},
): Promise<ActionError> {
    const { toastSuccess = true } = options;
    const { project, mask } = buildProjectSettingUpdate(descriptor, value, projectId);

    try {
        await backendService.updateProject({ project, mask }).response;
    } catch (error) {
        return createActionError(
            "Failed to Update Project Settings",
            { action: descriptor.action },
            error as Error,
        );
    }

    if (toastSuccess) {
        toast.success(descriptor.successMessage ?? PROJECT_SETTING_SUCCESS_MESSAGE);
    }

    return undefined;
}
