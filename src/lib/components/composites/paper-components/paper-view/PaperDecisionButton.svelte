<script lang="ts">
    import { cn } from "$lib/utils/shadcn-helper";
    import Tooltip from "../../utils/Tooltip.svelte";
    import { resource } from "$lib/resource.svelte.js";
    import {
        type PaperDecisionButtonVariant,
        paperDecisionButtonVariants,
    } from "$lib/components/composites/paper-components/paper-view/decision-button-variants";
    import { shortcuts } from "$lib/global-state/shortcuts-visibility-state.svelte";

    interface ButtonContent {
        name: string;
        shortcut: string;
        tooltipText: string;
    }

    interface PaperDecisionButtonProps {
        loadingPaperId: Promise<string>;
        variant: PaperDecisionButtonVariant;
    }

    const { loadingPaperId, variant }: PaperDecisionButtonProps = $props();

    const paperId = resource<string, string | undefined>(loadingPaperId, {
        initialValue: undefined,
        resourceName: "paper ID",
    });

    /**
     * Return the content of the button, i.e. the button name, the shortcut and the tooltip text
     * based on the paper decision button variant.
     */
    function getButtonContent(): ButtonContent {
        switch (variant) {
            case "accept":
                return { name: "Accept", shortcut: "Ctrl+A", tooltipText: "Accept paper" };
            case "decline":
                return { name: "Decline", shortcut: "Ctrl+D", tooltipText: "Decline paper" };
            case "maybe":
                return {
                    name: "Maybe",
                    shortcut: "Ctrl+S",
                    tooltipText: "Mark paper as undecided",
                };
            default:
                /// TODO: find better return content (ideas from reviewer?)
                return { name: "", shortcut: "", tooltipText: "" };
        }
    }

    /**
     * Submit a review to the server.
     */
    function submitReview() {
        console.log(`Submit review for paper with id ${paperId.value}`);
    }
</script>

<!-- max width is fixed, see PaperView component for reason -->
<!--
@component
Button to decide and submit a review on a paper.

To customize which type of decision button it is, use the `variant` prop
that not only styles the button correctly but also change the behavior regarding
the submitted decision.

Usage:
```svelte
    <PaperDecisionButton
        {loadingPaperId}
        variant="accept"
    />
```
-->
<Tooltip
    class={cn(
        "text-primary max-w-[20rem] flex-grow-1000 shadow-lg",
        paperDecisionButtonVariants({ variant }),
    )}
    data-testid={`decision-button-${variant}`}
    onclick={submitReview}
    triggerSize="default"
    triggerVariant="default"
>
    {#snippet trigger()}
        <p>{getButtonContent().name}</p>
        {#if shortcuts.isVisible}
            <p>{getButtonContent().shortcut}</p>
        {/if}
    {/snippet}
    {#snippet content()}
        {getButtonContent().tooltipText}
    {/snippet}
</Tooltip>
