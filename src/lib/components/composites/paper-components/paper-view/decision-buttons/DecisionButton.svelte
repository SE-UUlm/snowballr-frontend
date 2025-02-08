<script lang="ts">
    import { cn } from "$lib/utils/shadcn-helper";
    import type { WithElementRef } from "svelte-toolbelt";
    import Tooltip from "../../../Tooltip.svelte";
    import type { TooltipTriggerProps } from "bits-ui";
    import type { Snippet } from "svelte";

    type Props = WithElementRef<TooltipTriggerProps> & {
        buttonContent: Snippet;
        tooltipContent: Snippet;
        loadingPaperId: Promise<string>;
        onClick: (paperId: string) => void;
    };

    const {
        buttonContent,
        tooltipContent,
        loadingPaperId,
        onClick,
        class: className,
        ...restProps
    }: Props = $props();

    let paperId = $state<string | undefined>(undefined);
    loadingPaperId.then((id) => (paperId = id)).catch(() => (paperId = undefined));

    function onButtonClick() {
        if (paperId) {
            onClick(paperId);
        } else {
            console.error("Paper ID is not set");
        }
    }
</script>

<!-- max width is fixed, see PaperView component for reason -->
<!--
@component
Button to decide on a paper.

Rather use `AcceptButton` or `DeclineButton` or `MaybeButton` instead of this component.

Usage:
```svelte
    <DecisionButton
        class="bg-decline-red"
        onClick={(paperId) => console.log("clicked button")}
        {loadingPaperId}
    >
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
    onclick={onButtonClick}
    {...restProps}
    data-testid="decision-button"
></Tooltip>
