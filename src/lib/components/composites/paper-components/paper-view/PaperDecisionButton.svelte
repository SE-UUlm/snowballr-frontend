<script lang="ts">
    import { cn } from "$lib/utils/shadcn-helper";
    import Tooltip from "../../utils/Tooltip.svelte";
    import {
        type PaperDecisionButtonVariant,
        paperDecisionButtonVariants,
    } from "$lib/components/composites/paper-components/paper-view/decision-button-variants";
    import { shortcuts } from "$lib/global-state/shortcuts-visibility-state.svelte";
    import { backendService } from "$lib/grpc-api";
    import { type Review_Create, ReviewDecision } from "$lib/model/api/review";

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

    function getDecision(): ReviewDecision {
        switch (variant) {
            case "accept":
                return ReviewDecision.ACCEPTED;
            case "decline":
                return ReviewDecision.DECLINED;
            case "maybe":
                return ReviewDecision.MAYBE;
            default:
                return ReviewDecision.UNSPECIFIED;
        }
    }

    /**
     * Submit a review to the server.
     */
    async function submitReview() {
        try {
            const paperId = await loadingPaperId;

            const review: Review_Create = {
                projectPaperId: paperId,
                decision: getDecision(),
                selectedCriteriaIds: [],
            };

            await backendService.createReview(review);

            // TODO: navigate automatically to next paper
        } catch (err) {
            console.error(`Could not submit, as an invalid paper id was provided (${err})`);
        }
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
