<script lang="ts">
    import { cn } from "$lib/utils/shadcn-helper";
    import type { WithElementRef } from "svelte-toolbelt";
    import Tooltip from "../../../Tooltip.svelte";
    import type { TooltipTriggerProps } from "bits-ui";
    import type { Snippet } from "svelte";
    import { resource } from "$lib/resource.svelte";

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

    const paperId = resource<string, string | undefined>(loadingPaperId, {
        initialValue: undefined,
        ressourceName: "paper ID",
    });

    function onButtonClick() {
        if (paperId.value) {
            onClick(paperId.value);
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
    content={tooltipContent}
    onclick={onButtonClick}
    trigger={buttonContent}
    triggerSize="default"
    triggerVariant="default"
    {...restProps}
    data-testid="decision-button"
></Tooltip>
