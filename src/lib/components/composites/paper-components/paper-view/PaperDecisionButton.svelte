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
    import { LoaderCircle } from "lucide-svelte";

    interface ButtonContent {
        name: string;
        shortcut: string;
        tooltipText: string;
    }

    interface PaperDecisionButtonProps {
        projectPaperId: string;
        variant: PaperDecisionButtonVariant;
        isSubmittingReview?: boolean;
    }

    let {
        projectPaperId,
        variant,
        isSubmittingReview = $bindable(false),
    }: PaperDecisionButtonProps = $props();

    let showLoadingSpinner = $state(false);

    /**
     * Returns the content of the button, i.e. the button name, the shortcut and the tooltip text
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
                return { name: "", shortcut: "", tooltipText: "" };
        }
    }

    /**
     * Returns the review decision based on the paper decision button variant.
     */
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
     * Submits a review to the server.
     */
    async function submitReview() {
        isSubmittingReview = showLoadingSpinner = true;
        try {
            const review: Review_Create = {
                projectPaperId: projectPaperId,
                decision: getDecision(),
                selectedCriteriaIds: [],
            };

            await backendService.createReview(review);
            // TODO: navigate automatically to next paper that will be implemented in #47
        } catch (err) {
            console.error(`Could not submit, as an invalid paper id was provided (${err})`);
        }
        isSubmittingReview = showLoadingSpinner = false;
    }
</script>

<!-- max width is fixed, see PaperView component for reason -->
<!--
@component
Button to decide and submit a review on a paper.

To customize which type of decision button it is, use the `variant` prop
that not only styles the button correctly but also change the behavior regarding
the submitted decision.

When the button is pressed and a review is submitted, the variable `isSubmittingReview` is set to
true to indicate that a review is submitted and no other decision buttons should be clickable.

Usage:
```svelte
    <PaperDecisionButton
        {projectPaperId}
        variant="accept"
        bind:isSubmittingReview
    />
```
-->
<Tooltip
    class={cn(
        "text-primary max-w-[20rem] flex-grow-1000 shadow-lg",
        paperDecisionButtonVariants({ variant }),
    )}
    data-testid={`decision-button-${variant}`}
    disabled={isSubmittingReview}
    onclick={submitReview}
    triggerSize="default"
    triggerVariant="default"
>
    {#snippet trigger()}
        {#if showLoadingSpinner}
            <LoaderCircle class="animate-spin" />
            Submitting review
        {:else}
            <p>{getButtonContent().name}</p>
            {#if shortcuts.isVisible}
                <p>{getButtonContent().shortcut}</p>
            {/if}
        {/if}
    {/snippet}
    {#snippet content()}
        {getButtonContent().tooltipText}
    {/snippet}
</Tooltip>
