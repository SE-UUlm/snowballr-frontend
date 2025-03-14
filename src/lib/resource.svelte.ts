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
 * If the promise rejects, the state will be set to {@link options.onErrorValue} if it is defined.
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
 * const loadingResource = backendService.getSomeData();
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
 * @returns The state that represents the loading resource.
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

    const rune = $state<{ value: TValue }>({
        value: initialValue,
    });

    loadingResource
        .then((value) => {
            rune.value = onSuccess(value);
        })
        .catch(() => {
            if (onErrorValue) {
                rune.value = onErrorValue;
            }
            console.error(`Couldn't load ${resourceName}`);
        });

    return rune;
};
