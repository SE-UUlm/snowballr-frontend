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
     * without fetching it again. If the load function does not take the value, e.g. because the user
     * left the page in the meantime, the value is discarded.
     *
     * Never rejects: the value comes from a request that already succeeded, so a failed refresh is only
     * logged and the previously loaded value stays shown.
     *
     * Known limitation: if two requests overlap and their responses arrive in a different order than the
     * server applied them, the value of the last response may be outdated. It is then shown until the
     * load function fetches the value again, e.g. after a reload.
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
            const entry = { projectId, value };
            primed = entry;
            try {
                await invalidate(dependencyKey);
            } catch (error) {
                console.error(`Couldn't refresh ${dependencyKey}: ${error}`);
            } finally {
                // Discard the entry if the load function did not take it, so that it is not handed to a
                // much later load as up to date. A newer entry primed in the meantime is kept.
                if (primed === entry) primed = undefined;
            }
        },
    };
}
