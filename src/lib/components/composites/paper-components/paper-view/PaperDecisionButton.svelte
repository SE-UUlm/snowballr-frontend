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
    import { getSelectedReviewCriteriaContext } from "$lib/custom-context/selected-review-criteria-context";
    import { toast } from "svelte-sonner";
    import { loadingWrapper } from "$lib/utils/common-helper";
    import { shortcut, type ShortcutEventDetail, type ShortcutTrigger } from "@svelte-put/shortcut";
    import { navigatePaper } from "$lib/utils/paper-navigation";
    import type { Project, Project_Paper } from "$lib/model/api/project";
    import { projectPaperLoading } from "$lib/global-state/project-paper-loading-state.svelte";

    interface ButtonContent {
        name: string;
        shortcut: string;
        tooltipText: string;
    }

    interface PaperDecisionButtonProps {
        variant: PaperDecisionButtonVariant;
        isSubmittingReview?: { value: boolean };
        userReview?: Review;
        loadingProject?: Promise<Project>;
        loadingProjectPaper: Promise<Project_Paper | undefined>;
        paperQueue?: Project_Paper[];
        nextProjectPaper?: Project_Paper;
    }

    let {
        variant,
        isSubmittingReview = $bindable({ value: false }),
        userReview = $bindable(undefined),
        loadingProjectPaper,
        loadingProject,
        paperQueue = $bindable([]),
        nextProjectPaper = $bindable(undefined),
    }: PaperDecisionButtonProps = $props();

    const wasAlreadyReviewed = $derived(userReview !== undefined);
    const showLoadingSpinner = $state({ value: false });

    const isLoading = $derived(projectPaperLoading.isLoading || isSubmittingReview.value);
    const isDisabled = $derived(isLoading || wasAlreadyReviewed || showLoadingSpinner.value);

    /**
     * Returns the content of the button, i.e. the button name, the shortcut and the tooltip text
     * based on the paper decision button variant.
     */
    function getButtonContent(): ButtonContent {
        switch (variant) {
            case "accepted":
            case "selected_accepted":
                return { name: "Accept", shortcut: "Ctrl+a", tooltipText: "Accept paper" };
            case "declined":
            case "selected_declined":
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
            case "accepted":
                return ReviewDecision.ACCEPTED;
            case "declined":
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
            case "accepted":
                return { key: "a", modifier: "ctrl" };
            case "declined":
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
        try {
            isSubmittingReview.value = true;
            projectPaperLoading.isLoading = true;
            const paper = await loadingProjectPaper;
            const review: Review_Create = {
                projectPaperId: paper!.id,
                decision: getDecision(),
                selectedCriteriaIds: selectedReviewCriteriaState.criteria,
            };
            variant = "selected_" + variant;
            await backendService
                .createReview(review)
                .response.then((review) => (userReview = review));
            isSubmittingReview.value = false;
            toast.success("Successfully submitted a review.");
            await navigatePaper(
                "right",
                loadingProjectPaper,
                paperQueue,
                loadingProject,
                nextProjectPaper,
                undefined,
            );
            if (!nextProjectPaper) {
                toast.info("No more papers to review.");
            }
            projectPaperLoading.isLoading = false;
        } catch (err) {
            toast.error("Could not submit the review!", {
                description: "Please check your connection to the server.",
            });
            console.error("Could not submit the review:", err);
        }
    }

    const selectedReviewCriteriaState = getSelectedReviewCriteriaContext();
</script>

<!-- attach shortcuts for deciding on a paper -->
<svelte:window
    use:shortcut={{
        trigger: {
            ...getShortcutTrigger(),
            callback: (detail: ShortcutEventDetail) => {
                const keyboardEvent = detail.originalEvent;
                keyboardEvent.preventDefault();

                loadingWrapper(showLoadingSpinner, submitReview, {});
            },
            enabled: !wasAlreadyReviewed && !showLoadingSpinner.value,
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
        {loadingProject}
        {loadingProjectPaper}
        projectPaperId={paper.id}
        variant={userReview?.decision === ReviewDecision.DECLINED
            ? "selected_declined"
            : "declined"}
        bind:userReview
        bind:loading
        bind:isSubmittingReview
        bind:paperQueue
        bind:nextProjectPaper
    />
```
-->
<Tooltip
    class={cn(
        "text-primary max-w-[20rem] flex-grow-1000 shadow-lg",
        paperDecisionButtonVariants({ variant: variant }),
    )}
    data-testid={`decision-button-${variant}`}
    disabled={isDisabled}
    loading={isLoading}
    onclick={(args) => loadingWrapper(showLoadingSpinner, submitReview, args)}
    triggerSize="default"
    triggerVariant="default"
>
    {#snippet trigger()}
        <p>{getButtonContent().name}</p>
        {#if shortcuts.isVisible}
            <p>{getButtonContent().shortcut}</p>
        {/if}
    {/snippet}
    {#snippet loadingTrigger()}
        {#if isSubmittingReview.value}
            Submitting review
        {:else}
            Loading
        {/if}
    {/snippet}
    {#snippet content()}
        {getButtonContent().tooltipText}
    {/snippet}
</Tooltip>
