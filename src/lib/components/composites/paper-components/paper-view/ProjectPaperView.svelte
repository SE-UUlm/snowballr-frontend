<script lang="ts">
    import PaperView, {
        type ProjectSpecificPaperViewProps,
    } from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";
    import ButtonBar from "$lib/components/composites/paper-components/paper-view/ButtonBar.svelte";
    import type { ForwardAndBackwardReferencesCardContentProps } from "$lib/components/composites/paper-components/paper-view/cards/PaperResearchContextCard.svelte";
    import type { Project } from "$lib/model/api/project";
    import type { Review } from "$lib/model/api/review.js";
    import { setAlreadyReviewedContext } from "$lib/custom-context/was-paper-reviewed-context";
    import { setSelectedReviewCriteriaContext } from "$lib/custom-context/selected-review-criteria-context";
    import { projectPaperLoading } from "$lib/global-state/project-paper-loading-state.svelte.js";
    import { toast } from "svelte-sonner";
    import { getUserContext } from "$lib/custom-context/user-context";

    export type ProjectPaperViewProps = {
        projectId: string;
        loadingProject: Promise<Project>;
    } & ForwardAndBackwardReferencesCardContentProps &
        ProjectSpecificPaperViewProps;

    const {
        projectId,
        backwardReferencedPapers,
        forwardReferencedPapers,
        criteriaWithReviews,
        reviewers,
        loadingPaper: loadingProjectPaper,
        loadingProject,
    }: ProjectPaperViewProps = $props();

    const user = $derived(getUserContext());
    let userReview: Review | undefined = $state(undefined);

    /**
     * Makes sure that all necessary resources are loaded.
     */
    $effect(() => {
        (async () => {
            projectPaperLoading.isLoading = true;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const promises: Promise<any>[] = [
                loadingProjectPaper,
                forwardReferencedPapers,
                backwardReferencedPapers,
                loadingProject,
                getUserReviewIfAlreadySubmitted().then((review) => {
                    userReview = review;
                }),
            ];

            if (reviewers) promises.push(reviewers);
            if (criteriaWithReviews) promises.push(criteriaWithReviews);

            await Promise.all(promises)
                .then(() => {
                    projectPaperLoading.isLoading = false;
                })
                .catch(() => {
                    toast.error("Something went wrong while loading the paper!");
                });
        })();
    });

    const selectedReviewCriteria = $state({
        criteria: [] as string[],
    });
    // Save reactive state for the selected review criteria from the `CriteriaList`
    // in context, so this state is scoped to the `PaperView` component.
    setSelectedReviewCriteriaContext(selectedReviewCriteria);

    const wasAlreadyReviewedState = $state({
        wasReviewed: false,
    });
    setAlreadyReviewedContext(wasAlreadyReviewedState);

    $effect(() => {
        (async () => {
            projectPaperLoading.isLoading = true;
            userReview = await getUserReviewIfAlreadySubmitted();
            selectedReviewCriteria.criteria = userReview?.selectedCriteriaIds ?? [];
            wasAlreadyReviewedState.wasReviewed = userReview !== undefined;
            projectPaperLoading.isLoading = false;
        })();
    });

    /**
     * Gets the review of the user currently logged in for this paper,
     * if such a review exist, i.e. the paper is a project paper and the
     * user already reviewed this paper.
     *
     * @returns a promise containing the loading review if it exists, otherwise undefined
     */
    async function getUserReviewIfAlreadySubmitted(): Promise<Review | undefined> {
        try {
            const projectPaper = await loadingProjectPaper;
            return projectPaper.reviews.find((review) => review.userId === user.id);
        } catch (err) {
            toast.error("Could not load the user review");
            console.error("Could not load the user review:", err);
            return undefined;
        }
    }
</script>

<!--
@component
PaperView for papers inside a project.

Next to the PaperView, there's a button bar at the bottom, which includes navigation and decision buttons.

Usage:
```svelte
    <ProjectPaperView
        {backwardReferencedPapers}
        {criteriaWithReviews}
        {forwardReferencedPapers}
        {reviewers}
        loadingPaper={loadingProjectPaper}
        {loadingProject}
        {projectId}
    />
```
-->
<PaperView
    allowEditModeToggle
    backRef={`/project/${projectId}/dashboard`}
    {backwardReferencedPapers}
    {criteriaWithReviews}
    {forwardReferencedPapers}
    loadingPaper={loadingProjectPaper}
    {reviewers}
>
    <!-- In the bottom, there are buttons to accept, decline or mark the paper as undecided. -->
    <!-- Additionally, there are buttons to navigate to the previous or next paper. -->
    {#snippet bottomBar()}
        <ButtonBar {loadingProject} {loadingProjectPaper} bind:userReview />
    {/snippet}
</PaperView>
