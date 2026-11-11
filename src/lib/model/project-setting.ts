import { updateProjectSettings, type ProjectSettingsPatch } from "$lib/api/project";
import type { Project } from "$lib/api/types";
import { createActionError, type ActionError } from "$lib/model/action-error";
import { toast } from "svelte-sonner";

/** The success message shown after a project setting was updated, unless the descriptor overrides it. */
export const PROJECT_SETTING_SUCCESS_MESSAGE = "Successfully updated the project settings.";

/**
 * Describes a single project setting, i.e. one field of a project's configuration.
 *
 * A descriptor says how to read the setting off a {@link Project} and how to turn a new value into a
 * patch of the project settings. `updateProjectSettings` from `$lib/api/project` sends the patch;
 * toasting and error mapping are owned by this module.
 */
export interface ProjectSettingDescriptor<T> {
    /**
     * Reads the current value of the setting from a project.
     *
     * This is also the single source of the setting's default: it is applied to an empty project to
     * determine the value shown while the real project is still loading.
     */
    read: (project: Project) => T;
    /** Turns a new value into a plain, sparse patch of the project settings, see {@link ProjectSettingsPatch}. */
    toPatch: (value: T) => ProjectSettingsPatch;
    /** Description of the action, used in the error details, e.g. "updating the similarity threshold". */
    action: string;
    /** Overrides {@link PROJECT_SETTING_SUCCESS_MESSAGE} for this setting. */
    successMessage?: string;
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
    const patch = descriptor.toPatch(value);

    try {
        await updateProjectSettings(projectId, patch);
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
