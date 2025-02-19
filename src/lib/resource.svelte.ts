/**
 * Wrapper for a resource state that is loading.
 *
 * As long as the promise is pending, the state will have the initial value {@link options.initialValue}.
 * When the promise resolves, the state will be set to the value returned by {@link options.onSuccess}.
 * If the promise rejects, the state will be set to {@link options.onErrorValue} if it is defined.
 *
 * The value of the state can be accessed via the `value` property.
 *
 * Usage:
 * ```ts
 * const loadingResource = backendService.getSomeData();
 *
 * const state = resource(loadingResource, {
 *    initialValue: [],
 *    onSuccess: (data) => data,
 *    onErrorValue: undefined,
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
 * @param options.initialValue - The initial value of the state.
 * @param options.onSuccess - The function that is called when the promise resolves and sets the value of the state.
 * @param options.onErrorValue - The value that is set when the promise rejects.
 * @returns The state that represents the loading resource.
 */
export const resource = <TPromise, TValue>(
    loadingResource: Promise<TPromise>,
    options: {
        initialValue: TValue;
        onSuccess: (value: TPromise) => TValue;
        onErrorValue?: TValue;
    },
) => {
    const { initialValue, onSuccess, onErrorValue } = options;

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
        });

    return rune;
};
