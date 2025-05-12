<script lang="ts">
    import { cn } from "$lib/utils/shadcn-helper";
    import Tooltip from "../../utils/Tooltip.svelte";
    import {
        type PaperDecisionButtonVariant,
        paperDecisionButtonVariants,
    } from "$lib/components/composites/paper-components/paper-view/decision-button-variants";
    import { shortcuts } from "$lib/global-state/shortcuts-visibility-state.svelte";
    import { backendService } from "$lib/grpc-api";
    import { type Review, type Review_Create, ReviewDecision } from "$lib/model/api/review";
    import { LoaderCircle } from "lucide-svelte";
    import { getSelectedReviewCriteriaContext } from "$lib/utils/custom-context";
    import { toast } from "svelte-sonner";
    import { shortcut, type ShortcutTrigger } from "@svelte-put/shortcut";

    interface ButtonContent {
        name: string;
        shortcut: string;
        tooltipText: string;
    }

    interface PaperDecisionButtonProps {
        projectPaperId: string;
        variant: PaperDecisionButtonVariant;
        isSubmittingReview?: boolean;
        userReview?: Review;
    }

    let {
        projectPaperId,
        variant,
        isSubmittingReview = $bindable(false),
        userReview,
    }: PaperDecisionButtonProps = $props();

    const wasAlreadyReviewed = userReview !== undefined;
    let showLoadingSpinner = $state(false);

    /**
     * Returns the content of the button, i.e. the button name, the shortcut and the tooltip text
     * based on the paper decision button variant.
     */
    function getButtonContent(): ButtonContent {
        switch (variant) {
            case "accept":
            case "selected_accept":
                return { name: "Accept", shortcut: "Ctrl+a", tooltipText: "Accept paper" };
            case "decline":
            case "selected_decline":
                return { name: "Decline", shortcut: "Ctrl+d", tooltipText: "Decline paper" };
            case "maybe":
            case "selected_maybe":
                return {
                    name: "Maybe",
                    shortcut: "Ctrl+s",
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
     * Returns the shortcut trigger based on the paper decision button variant.
     */
    function getShortcutTrigger(): ShortcutTrigger {
        switch (variant) {
            case "accept":
                return { key: "a", modifier: "ctrl" };
            case "decline":
                return { key: "d", modifier: "ctrl" };
            case "maybe":
                return { key: "s", modifier: "ctrl" };
            default:
                return { key: "" };
        }
    }

    /**
     * Submits a review to the server containing the review decision and the selected criteria.
     *
     * While the review is submitted, all decision buttons on this paper view page are disabled
     * and a loading spinner is shown. After the review was submitted, a confirmation toast is shown.
     */
    async function submitReview() {
        isSubmittingReview = showLoadingSpinner = true;
        try {
            const review: Review_Create = {
                projectPaperId: projectPaperId,
                decision: getDecision(),
                selectedCriteriaIds: selectedReviewCriteriaState.criteria,
            };

            await backendService.createReview(review);

            toast.success("Successfully submitted a review.");
            // TODO: navigate automatically to next paper that will be implemented in #47
        } catch (err) {
            toast.error("Could not submit the review!", {
                description: "Please check your connection to the server.",
            });
            console.error("Could not submit the review:", err);
        }
        isSubmittingReview = showLoadingSpinner = false;
    }

    const selectedReviewCriteriaState = getSelectedReviewCriteriaContext();
</script>

<!-- attach shortcuts for deciding on a paper -->
<svelte:window
    use:shortcut={{
        trigger: {
            ...getShortcutTrigger(),
            callback: () => submitReview(),
            enabled: !wasAlreadyReviewed,
        },
    }}
/>

<!-- max width is fixed, see PaperView component for reason -->
<!--
@component
Button to decide and submit a review on a paper.

To customize which type of decision button it is, use the `variant` prop
that not only styles the button correctly but also change the behavior regarding
the submitted decision.

When the button is pressed and a review is submitted, the variable `isSubmittingReview` is set to
true to indicate that a review is submitted and no other decision buttons should be clickable.

The `userReview` property can be used to optionally pass the review given by the user currently
logged in. If the user already submitted a review, then the decision button is styled according
to the decision, i.e.
- if the decision corresponds to the button variant, then button is disabled but looks like an
enabled button and has a ring around it
- otherwise, it is styled as an ordinary disabled button

Usage:
```svelte
    <PaperDecisionButton
        {projectPaperId}
        {userReview}
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
    disabled={isSubmittingReview || wasAlreadyReviewed}
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
