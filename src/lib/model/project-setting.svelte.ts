import { Project } from "$api/project";
import type { ActionError } from "$lib/model/action-error";
import {
    commitProjectSetting,
    loadProjectSetting,
    type ProjectSettingDescriptor,
} from "$lib/model/project-setting";

/** Options for creating a {@link projectSetting} state. */
export interface ProjectSettingOptions {
    /** The id of the project whose setting is edited. */
    projectId: string;
    /** The promise of the project the setting is read from. */
    loadingProject: Promise<Project>;
    /** Whether the surrounding settings section is locked, e.g. because a review was already submitted. */
    settingsLocked?: () => boolean;
    /**
     * Whether the project is archived.
     *
     * Passed as an accessor rather than read from the context here, so that this module stays free of
     * Svelte context and can be exercised without mounting a component. Components supply
     * `() => getIsProjectArchivedContext().isProjectArchived`.
     */
    isArchived?: () => boolean;
}

/** Reactive state of a single, optimistically updated project setting. */
export interface ProjectSettingState<T> {
    /** The currently displayed value. Bindable, e.g. `bind:value={setting.value}`. */
    value: T;
    /** Whether the setting is either still loading or an update is in flight. */
    readonly loading: boolean;
    /** Whether the setting may not be changed at all. */
    readonly locked: boolean;
    /** Whether the control should be disabled, i.e. locked or busy. */
    readonly disabled: boolean;
    /** The error of the last load or update, if any. */
    readonly error: ActionError;
    /** Persists a new value, rolling back to the last stored value if the update fails. */
    commit: (next: T) => Promise<void>;
}

/**
 * Creates the reactive state of a single project setting that is updated optimistically, i.e. the
 * control moves immediately and is rolled back if the update fails.
 *
 * The initial value is the descriptor's `read` applied to an empty project, so a setting's default
 * is defined once, in its descriptor. While loading, and while an update is in flight, the setting
 * reports itself as disabled and further commits are dropped.
 *
 * Settings that only change *after* the backend confirms (e.g. behind a confirmation dialog) should
 * use `commitProjectSetting` from `$lib/model/project-setting` directly instead.
 *
 * Usage:
 * ```ts
 * const setting = projectSetting(similarityThreshold, {
 *     projectId,
 *     loadingProject,
 *     settingsLocked: () => slrSettingsLocked,
 *     isArchived: () => isProjectArchived,
 * });
 * ```
 *
 * @param descriptor - The setting to read and update
 * @param options - The project to read from and the lock accessors
 * @returns The reactive state of the setting
 */
export function projectSetting<T>(
    descriptor: ProjectSettingDescriptor<T>,
    options: ProjectSettingOptions,
): ProjectSettingState<T> {
    const {
        projectId,
        loadingProject,
        settingsLocked = () => false,
        isArchived = () => false,
    } = options;

    const defaultValue = descriptor.read(Project.create());

    let value = $state<T>(defaultValue);
    let storedValue = $state<T>(defaultValue);
    let loading = $state(true);
    let error = $state<ActionError>(undefined);

    void loadProjectSetting(descriptor, loadingProject).then((result) => {
        if (result.loaded) {
            value = result.value;
            storedValue = result.value;
        } else {
            error = result.error;
        }
        loading = false;
    });

    async function commit(next: T): Promise<void> {
        // Drop commits while the setting is still loading or an update is already in flight, so that
        // two overlapping updates can never race to decide the stored value.
        if (loading) return;
        if (next === storedValue) return;

        loading = true;
        error = undefined;
        value = next;

        const commitError = await commitProjectSetting(descriptor, next, projectId);

        if (commitError !== undefined) {
            error = commitError;
            value = storedValue;
        } else {
            storedValue = next;
        }

        loading = false;
    }

    return {
        get value() {
            return value;
        },
        set value(next: T) {
            value = next;
        },
        get loading() {
            return loading;
        },
        get locked() {
            return settingsLocked() || isArchived();
        },
        get disabled() {
            return settingsLocked() || isArchived() || loading;
        },
        get error() {
            return error;
        },
        commit,
    };
}
