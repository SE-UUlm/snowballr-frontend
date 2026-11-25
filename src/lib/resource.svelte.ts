import { isApiError } from "#lib/api/errors.js";

/** Whether the promise of a {@link resource} is still pending, has resolved or has rejected. */
export type ResourceStatus = "pending" | "resolved" | "rejected";

interface ResourceOptions<TPromise, TValue> {
    /** The initial value of the state */
    initialValue: TValue;
    /** The function that is called when the promise resolves and sets the value of the state */
    onSuccess?: (value: TPromise) => TValue;
    /** The value that is set when the promise rejects */
    onErrorValue?: TValue;
    /** The name of the resource that is used for error logging */
    resourceName?: string;
}

/**
 * Wrapper for a resource state that is loading.
 *
 * As long as the promise is pending, the state will have the initial value {@link options.initialValue}.
 * When the promise resolves, the state will be set to the value returned by {@link options.onSuccess}.
 * If the promise rejects, the state will be set to {@link options.onErrorValue} if it is defined, and
 * the failure is logged, unless it is an `ApiError` of kind `"cancelled"`.
 *
 * The `status` property tells whether the promise is still pending, has resolved or has rejected,
 * e.g. to disable an action until the resource has loaded.
 *
 * The value of the state can be accessed via the `value` property.
 *
 * The default value of {@link options.onSuccess} is the identity function
 * (**Note:** This might cause errors when {@link TPromise} and {@link TValue} are not they same).
 *
 * The default value of {@link options.resourceName} is "resource".
 *
 * Usage:
 * ```ts
 * const loadingResource = getSomeData(); // a domain function from #lib/api/
 *
 * const state = resource(loadingResource, {
 *    initialValue: [],
 *    onSuccess: (data) => data.property,
 *    onErrorValue: undefined,
 *    resourceName: "SomeData",
 * });
 *
 * ...
 *
 * {#each $state.value as item}
 *    <div>{item}</div>
 * {/each}
 * ```
 *
 * @param loadingResource - The promise representing the loading resource.
 * @param options - The options for the resource state.
 * @returns The state that represents the loading resource, with its `value` and `status`.
 */
export const resource = <TPromise, TValue>(
    loadingResource: Promise<TPromise>,
    options: ResourceOptions<TPromise, TValue>,
) => {
    const {
        initialValue,
        onSuccess = (v) => v as unknown as TValue,
        onErrorValue,
        resourceName = "resource",
    } = options;

    const rune = $state<{ value: TValue; status: ResourceStatus }>({
        value: initialValue,
        status: "pending",
    });

    loadingResource
        .then((value) => {
            rune.value = onSuccess(value);
            rune.status = "resolved";
        })
        .catch((error: unknown) => {
            if (onErrorValue) {
                rune.value = onErrorValue;
            }
            rune.status = "rejected";
            if (!isApiError(error, "cancelled")) {
                console.error(`Couldn't load ${resourceName}`);
            }
        });

    return rune;
};
