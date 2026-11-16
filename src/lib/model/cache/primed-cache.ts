import { invalidate } from "$app/navigation";

/**
 * Hands a value that is already known to be up to date, e.g. because it was just returned by an update
 * request, to the next run of a load function exactly once, so that the load function does not have to
 * fetch the value again.
 */
export interface PrimedCache<T> {
    /**
     * Takes the primed value, if it belongs to the given project id.
     * This is primarily for use by the load function.
     *
     * The primed value is cleared in any case, so that later loads fetch the value again.
     *
     * @param projectId - The id of the project that is loaded
     * @returns The primed value, or undefined if there is none for the given project id
     */
    take(projectId: string): T | undefined;

    /**
     * Replaces the value loaded by the load function with the given, already up-to-date value.
     *
     * The value is primed and the load function is invalidated, so it picks up the given value
     * without fetching it again.
     *
     * @param projectId - The id of the project the value belongs to
     * @param value - The up-to-date value
     */
    refresh(projectId: string, value: T): Promise<void>;
}

/**
 * Creates a {@link PrimedCache} for the load function that depends on the given key.
 *
 * @param dependencyKey - The key the load function depends on via `depends(...)`
 */
export function createPrimedCache<T>(dependencyKey: string): PrimedCache<T> {
    let primed: { projectId: string; value: T } | undefined = undefined;

    return {
        take(projectId) {
            const entry = primed;
            primed = undefined;
            return entry?.projectId === projectId ? entry.value : undefined;
        },

        async refresh(projectId, value) {
            primed = { projectId, value };
            await invalidate(dependencyKey);
        },
    };
}
