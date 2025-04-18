<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { type WithElementRef } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";
    import { shortcuts } from "$lib/global-state/shortcuts-visibility-state.svelte";

    let {
        ref = $bindable(null),
        class: className,
        children,
        ...restProps
    }: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

{#if shortcuts.isVisible}
    <span
        bind:this={ref}
        class={cn("ml-auto text-xs tracking-widest opacity-60", className)}
        {...restProps}
    >
        {@render children?.()}
    </span>
{/if}
