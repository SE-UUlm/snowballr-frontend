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
    class={cn(
        "[&_a]:hover:text-foreground text-sm text-balance md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
        className,
    )}
    data-slot="alert-description"
    {...restProps}
>
    {@render children?.()}
</div>
