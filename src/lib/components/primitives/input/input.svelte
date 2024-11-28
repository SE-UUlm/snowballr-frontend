<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import type { WithElementRef } from "bits-ui";
    import { cn } from "$lib/utils.js";

    let {
        ref = $bindable(null),
        value = $bindable(),
        class: className,
        ...restProps
    }: WithElementRef<HTMLInputAttributes> = $props();
</script>

<input
    bind:this={ref}
    class={cn(
        "border-input-border-slate bg-background ring-offset-background placeholder:text-placeholder flex h-fit w-full rounded-md border px-4 py-3 text-default file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
    )}
    bind:value
    {...restProps}
/>
