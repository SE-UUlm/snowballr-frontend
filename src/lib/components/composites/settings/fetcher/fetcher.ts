import type { Fetchers } from "#lib/api/fetcher.js";
import type { ActionError } from "#lib/model/action-error.js";

/**
 * Persists a new fetchers map for whatever entity (project or user) owns it.
 *
 * Implementations are responsible for calling either `onSuccess` or `onError`
 * once the update request settles.
 */
export type SaveFetchers = (
    fetchers: Fetchers,
    onSuccess: () => void,
    onError: (error: ActionError) => void,
) => Promise<void>;
