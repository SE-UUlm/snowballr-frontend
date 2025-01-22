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

    $effect(() => {
        loadingResource
            .then((value) => {
                rune.value = onSuccess(value);
            })
            .catch(() => {
                if (onErrorValue) {
                    rune.value = onErrorValue;
                }
            });
    });

    return rune;
};
