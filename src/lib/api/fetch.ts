// The `fetch` that backend calls go through. Unlike client.ts, this module is public, so that the root
// layout can pass on the `fetch` of its load function. It stays when the REST client replaces the
// gRPC one.

let currentFetch: typeof fetch = globalThis.fetch;

/**
 * Sets the `fetch` that backend calls use from now on.
 *
 * @param newFetch - The `fetch` to use, e.g. the one SvelteKit passes to a load function
 */
export function setFetch(newFetch: typeof fetch): void {
    currentFetch = newFetch;
}

/**
 * Returns the `fetch` that backend calls currently use.
 *
 * @returns The `fetch` last passed to {@link setFetch}, or the global `fetch` before that
 */
export function getFetch(): typeof fetch {
    return currentFetch;
}
