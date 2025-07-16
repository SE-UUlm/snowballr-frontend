<script lang="ts">
    import PaperNavigationButton from "./PaperNavigationButton.svelte";
    import type { Project, Project_Paper } from "$lib/model/api/project";
    import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
    import PaperDecisionButton from "$lib/components/composites/paper-components/paper-view/PaperDecisionButton.svelte";
    import { type Review, ReviewDecision } from "$lib/model/api/review";
    import type { PaperDecisionButtonVariant } from "./decision-button-variants";

    type ButtonBarProps = {
        userReview?: Review;
        loadingProjectPaper: Promise<Project_Paper | undefined>;
        loadingProject: Promise<Project>;
    };

    let {
        userReview = $bindable(undefined),
        loadingProjectPaper,
        loadingProject,
    }: ButtonBarProps = $props();

    let paperQueue = $state([]);
    let nextProjectPaper: Project_Paper | undefined = $state(undefined);
    let isSubmittingReview = $state({ value: false });

    const decisionButtonsData: {
        decision: ReviewDecision;
        variant: PaperDecisionButtonVariant;
        selectedVariant: PaperDecisionButtonVariant;
    }[] = [
        {
            decision: ReviewDecision.DECLINED,
            variant: "declined",
            selectedVariant: "selected_declined",
        },
        { decision: ReviewDecision.MAYBE, variant: "maybe", selectedVariant: "selected_maybe" },
        {
            decision: ReviewDecision.ACCEPTED,
            variant: "accepted",
            selectedVariant: "selected_accepted",
        },
    ];
</script>

<div class="flex h-fit w-full flex-row justify-between gap-4" data-testid="button-bar">
    <PaperNavigationButton
        direction="left"
        {loadingProject}
        {loadingProjectPaper}
        bind:paperQueue
        bind:nextProjectPaper
    />
    {#if reviewMode.isActivated}
        {#await loadingProject then project}
            <!-- flex grow is very high so that it grows first, before the navigation buttons do -->
            <!-- max-width is max-width of buttons + gap, which is the reason why they have fixed values -->
            <div class="flex max-w-[62rem] flex-grow-1000 justify-center gap-4">
                {#each decisionButtonsData as data (data.decision)}
                    <!-- Skip maybe button when the maybe decision is not allowed -->
                    {#if data.decision !== ReviewDecision.MAYBE || project.settings?.reviewMaybeAllowed}
                        <PaperDecisionButton
                            {loadingProject}
                            {loadingProjectPaper}
                            variant={userReview?.decision === data.decision
                                ? data.selectedVariant
                                : data.variant}
                            bind:userReview
                            bind:isSubmittingReview
                            bind:paperQueue
                            bind:nextProjectPaper
                        />
                    {/if}
                {/each}
            </div>
        {/await}
    {/if}
    <PaperNavigationButton
        direction="right"
        {loadingProject}
        {loadingProjectPaper}
        bind:paperQueue
        bind:nextProjectPaper
    />
</div>
