<script lang="ts">
    import type { WithElementRef, WithoutChildren } from "bits-ui";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> = $props();
</script>

<div
    bind:this={ref}
    class={cn("bg-muted animate-pulse rounded-md", className)}
    data-testid="skeleton"
    {...restProps}
></div>
