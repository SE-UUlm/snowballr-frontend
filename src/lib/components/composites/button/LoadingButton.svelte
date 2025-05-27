<script lang="ts">
    import Button, { type ButtonProps } from "$lib/components/primitives/button/button.svelte";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";

    type Props = ButtonProps & {
        label: string;
        loadingLabel?: string;
        loading?: boolean;
    };

    const {
        label,
        loadingLabel = label,
        loading = false,
        disabled: disabledProp,
        ...restProps
    }: Props = $props();
</script>

<!--
@component Button component that also handles the loading state.

This component is intended to be used for buttons that will be in a loading state while,
waiting for an asynchronous calls, such as form submit buttons that invoke a call to the
backend server.

To keep the same size in both states (loading and not loading), it is required to
manually set the size according to the label with the bigger width (see example).

The loading state works best when it's bound to a boolean state. When calling the according
asynchronous call, set the state to true and afterward to false. The button will be disabled
while being in the loading state to prohibit unwanted subsequent calls.

Usage 1:
```svelte
    let loading = $state(false);

    function foo() {
        loading = true;
        // ...
        loading = false;
    }

    <LoadingButton
        class="w-68"
        type="submit"
        label="Process data"
        loadingLabel="Processing data"
        bind:loading
    />
```

In many cases, there are several return statements in the asynchronous call, such as failure
case of the input validation, and before each return statement, one would have to set the loading
state to false. As this is quite cumbersome, one can use the `loadingWrapper` function that handles
such cases (see example).

Usage 2:
```svelte
    let loading = $state({ value: false }); // the value has to be a property for reactivity

    function foo() {
        if (!input.validate()) {
            return;
        }

        if (someOtherCondition()) {
            return;
        }

        // ...
    }

    <LoadingButton
        class="w-68"
        label="Process data"
        loadingLabel="Processing data"
        onclick={(args) => loadingWrapper(loading, foo, args)} // wrap `foo` in the wrapper function
        bind:loading={loading.value}
    />
```
-->
<Button disabled={disabledProp || loading} {...restProps}>
    {#if loading}
        <LoaderCircle class="animate-spin" />
        {loadingLabel}
    {:else}
        {label}
    {/if}
</Button>
