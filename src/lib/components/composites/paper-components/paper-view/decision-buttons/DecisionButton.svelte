<script lang="ts">
    import { cn } from "$lib/utils";
    import type { WithElementRef } from "svelte-toolbelt";
    import Tooltip from "../../../Tooltip.svelte";
    import type { TooltipTriggerProps } from "bits-ui";
    import type { Snippet } from "svelte";

    type Props = WithElementRef<TooltipTriggerProps> & {
        buttonContent: Snippet;
        tooltipContent: Snippet;
        onClick: () => void;
    };

    const {
        buttonContent,
        tooltipContent,
        onClick,
        class: className,
        ...restProps
    }: Props = $props();
</script>

<!-- max width is fixed, see PaperView component for reason -->
<!--
@component
Button to decide on a paper.

Rather use `AcceptButton` or `DeclineButton` or `MaybeButton` instead of this component.

Usage:
```svelte
    <DecisionButton class="bg-decline-red" onClick={() => console.log("clicked button")}>
        {#snippet buttonContent()}
            <p>This is a button</p>
        {/snippet}
        {#snippet tooltipContent()}
            <p>This is a tooltip</p>
        {/snippet}
    </DecisionButton>
```
-->
<Tooltip
    class={cn("text-primary max-w-[20rem] shadow-lg flex-grow-1000", className)}
    trigger={buttonContent}
    content={tooltipContent}
    onclick={onClick}
    {...restProps}
></Tooltip>
