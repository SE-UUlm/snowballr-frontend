<script lang="ts">
    import PaperNavigationButton from "./PaperNavigationButton.svelte";
    import type { Project, Project_Paper } from "$lib/model/api/project";
    import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
    import PaperDecisionButton from "$lib/components/composites/paper-components/paper-view/PaperDecisionButton.svelte";
    import { type Review, ReviewDecision } from "$lib/model/api/review";

    type ButtonBarProps = {
        userReview?: Review;
        loadingProjectPaper: Promise<Project_Paper | undefined>;
        loadingProject?: Promise<Project> | undefined;
    };

    let {
        userReview = $bindable(undefined),
        loadingProjectPaper,
        loadingProject,
    }: ButtonBarProps = $props();

    let paperQueue = $state([]);
    let nextProjectPaper: Project_Paper | undefined = $state(undefined);
    let isSubmittingReview = $state({ value: false });
</script>

<div class="flex h-fit w-full flex-row justify-between gap-4" data-testid="button-bar">
    <PaperNavigationButton
        direction="left"
        {loadingProject}
        {loadingProjectPaper}
        bind:paperQueue
        bind:nextProjectPaper
    />
    {#if reviewMode.isActivated && loadingProject}
        {#await Promise.all([loadingProject]) then [project]}
            <!-- flex grow is very high so that it grows first, before the navigation buttons do -->
            <!-- max-width is max-width of buttons + gap, which is the reason why they have fixed values -->
            <div class="flex max-w-[62rem] flex-grow-1000 justify-center gap-4">
                <PaperDecisionButton
                    {loadingProject}
                    {loadingProjectPaper}
                    variant={userReview?.decision === ReviewDecision.DECLINED
                        ? "selected_decline"
                        : "decline"}
                    bind:userReview
                    bind:isSubmittingReview
                    bind:paperQueue
                    bind:nextProjectPaper
                />
                {#if project.settings?.reviewMaybeAllowed}
                    <PaperDecisionButton
                        {loadingProject}
                        {loadingProjectPaper}
                        variant={userReview?.decision === ReviewDecision.MAYBE
                            ? "selected_maybe"
                            : "maybe"}
                        bind:userReview
                        bind:isSubmittingReview
                        bind:paperQueue
                        bind:nextProjectPaper
                    />
                {/if}
                <PaperDecisionButton
                    {loadingProject}
                    {loadingProjectPaper}
                    variant={userReview?.decision === ReviewDecision.ACCEPTED
                        ? "selected_accept"
                        : "accept"}
                    bind:userReview
                    bind:isSubmittingReview
                    bind:paperQueue
                    bind:nextProjectPaper
                />
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
