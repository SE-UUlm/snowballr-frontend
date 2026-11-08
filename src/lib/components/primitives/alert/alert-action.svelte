<script lang="ts">
    import { cn, type WithElementRef } from "$lib/utils/shadcn-helper.js";
    import type { HTMLAttributes } from "svelte/elements";

    let {
        ref = $bindable(null),
        class: className,
        children,
        ...restProps
    }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
    bind:this={ref}
    class={cn("absolute top-2 right-2", className)}
    data-slot="alert-action"
    {...restProps}
>
    {@render children?.()}
</div>
