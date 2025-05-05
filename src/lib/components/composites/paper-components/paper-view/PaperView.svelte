<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";
    import PaperDetailsCard from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCard.svelte";
    import PaperResearchContextCard, {
        type NonProjectResearchContextCardProps,
        type ProjectResearchContextCardProps,
    } from "$lib/components/composites/paper-components/paper-view/cards/PaperResearchContextCard.svelte";
    import type { CriterionWithReviews } from "$lib/model/general";
    import PaperBookmarkButton from "../../PaperBookmarkButton.svelte";
    import PaperNavigationButton from "./PaperNavigationButton.svelte";
    import type { User } from "$lib/model/api/user";
    import type { Paper } from "$lib/model/api/paper";
    import type { Project, Project_Paper } from "$lib/model/api/project";
    import type { ReferencesAndCitationsCardContentProps } from "./cards/ReferencesAndCitationsCardContent.svelte";
    import { asPaper, asProjectPaper, isProjectPaper } from "$lib/utils/model-helper";
    import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
    import PaperDecisionButton from "$lib/components/composites/paper-components/paper-view/PaperDecisionButton.svelte";
    import { getDisplayPaperId } from "$lib/utils/common-helper";
    import { setSelectedReviewCriteriaContext } from "$lib/utils/custom-context";
    import { type Review, ReviewDecision } from "$lib/model/api/review";

    export interface ProjectPaperViewProps {
        loadingPaper: Promise<Project_Paper>;
        loadingProject: Promise<Project>;
        reviewers: Promise<User[]>;
        criteriaWithReviews: Promise<CriterionWithReviews[]>;
    }

    export interface NonProjectPaperViewProps {
        loadingPaper: Promise<Paper>;
        loadingProject: undefined;
        reviewers: undefined;
        criteriaWithReviews: undefined;
    }

    export type IndependentPaperViewProps = ReferencesAndCitationsCardContentProps & {
        user: User;
        showButtonBar?: boolean;
        backRef: string;
        allowEditModeToggle?: boolean;
        startInEditMode?: boolean;
    };

    export type PaperViewProps = IndependentPaperViewProps &
        (ProjectPaperViewProps | NonProjectPaperViewProps);

    const data: PaperViewProps = $props();
    const {
        user,
        backwardReferencedPapers,
        forwardReferencedPapers,
        showButtonBar = false,
        backRef,
        allowEditModeToggle = false,
        startInEditMode = false,
        loadingPaper: loadingPaperWrapper,
        loadingProject,
        reviewers,
        criteriaWithReviews,
    } = $derived(data);

    const loadingPaper = $derived.by(() => loadingPaperWrapper.then(asPaper));
    const loadingPaperId = $derived.by(() => loadingPaper.then((paper) => paper.id));
    // As the navigation bar shows either the paper id or the local / relative id, if the paper
    // is a project paper, the id for the navigation bar must be handled differently
    const loadingPaperIdForNavigationBar = $derived.by(() =>
        loadingPaperWrapper.then((paper) => getDisplayPaperId(paper)),
    );

    // Statically define props, so that the type can be inferred when passing it to `PaperResearchContextCard`.
    // Note: this is ugly, but otherwise the types of these properties can't be inferred.
    let researchContextCardProps:
        | ProjectResearchContextCardProps
        | NonProjectResearchContextCardProps = $derived.by(() => {
        if (reviewers) {
            // This now of type `ProjectResearchContextCardProps`
            return {
                reviewers,
                criteriaWithReviews,
                loadingProjectPaper: loadingPaperWrapper,
            };
        } else {
            // This is now of type `NonProjectResearchContextCardProps`
            return {
                reviewers,
                criteriaWithReviews,
                loadingProjectPaper: loadingPaperWrapper,
            };
        }
    });

    const selectedReviewCriteria = $state({
        criteria: [] as string[],
    });
    // Save reactive state for the selected review criteria from the `CriteriaList`
    // in context, so this state is scoped to the `PaperView` component.
    setSelectedReviewCriteriaContext(selectedReviewCriteria);

    let isSubmittingReview = $state(false);
    const loadingUserReview = getUserReviewIfAlreadySubmitted();
    loadingUserReview.then((review) => {
        const selectedCriteria = review?.selectedCriteriaIds ?? [];
        selectedReviewCriteria.criteria = selectedCriteria;
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
            const paper = await loadingPaperWrapper;
            if (!isProjectPaper(paper)) {
                return undefined;
            }
            const projectPaper = asProjectPaper(paper)!;
            return projectPaper.reviews.find((review) => review.userId === user.id);
        } catch (err) {
            console.error(`Could not load user review (${err})`);
            return undefined;
        }
    }
</script>

<!--
@component
Whole page component to display information about a paper.
In the bottom, there are buttons to accept, decline or mark the paper as undecided.
Additionally, there are buttons to navigate to the previous or next paper.

- when `showButtonBar` is false, then no buttons are shown at the bottom of the page
- when `reviewMode.isActivated` is false, then no decision buttons are shown
- when `project.settings.reviewMaybeAllowed` is false, then the maybe button is not shown

Edit Mode:
- in the edit mode, the user can edit the paper details. When the mode is turned off, the details are displayed as read-only.
- when `allowEditModeToggle` is true, then the user can toggle the edit mode
- when `startInEditMode` is true, then the paper details can be edited from the start

Usage:
```svelte
    <PaperView
        {user}
        {loadingPaper}
        {loadingProject}
        {backwardReferencedPapers}
        {forwardReferencedPapers}
        {reviewers}
        {reviewedCriteria}
        showButtonBar
        backRef="/"
        allowEditModeToggle
        startInEditMode
    />
```
-->
<div class="flex h-fit w-full flex-row items-center justify-between gap-4">
    <PaperNavigationBar
        {backRef}
        {loadingPaper}
        loadingPaperId={loadingPaperIdForNavigationBar}
        {user}
    />
    <PaperBookmarkButton class="h-fit" isBookmarkedDefault={false} {loadingPaperId} />
</div>
<main class="flex h-full w-full flex-col gap-5 px-5 pb-2">
    <div class="flex h-full w-full flex-row gap-10">
        <PaperDetailsCard {allowEditModeToggle} {loadingPaper} {startInEditMode} />
        <PaperResearchContextCard
            {backwardReferencedPapers}
            {forwardReferencedPapers}
            {...researchContextCardProps}
        />
    </div>
    {#if showButtonBar}
        <div class="flex h-fit w-full flex-row justify-between gap-4" data-testid="button-bar">
            <!-- TODO: Implementation of navigation buttons will be done in #46 and #47 -->
            <PaperNavigationButton direction="left" href="" />
            {#if reviewMode.isActivated && loadingProject}
                {#await Promise.all( [loadingProject, loadingPaperWrapper, loadingUserReview], ) then [project, paper, userReview]}
                    <!-- flex grow is very high so that it grows first, before the navigation buttons do -->
                    <!-- max-width is max-width of buttons + gap, which is the reason why they have fixed values -->
                    <div class="flex max-w-[62rem] flex-grow-1000 justify-center gap-4">
                        <PaperDecisionButton
                            projectPaperId={paper.id}
                            {userReview}
                            variant={userReview?.decision === ReviewDecision.DECLINED
                                ? "selected_decline"
                                : "decline"}
                            bind:isSubmittingReview
                        />
                        {#if project.settings?.reviewMaybeAllowed}
                            <PaperDecisionButton
                                projectPaperId={paper.id}
                                {userReview}
                                variant={userReview?.decision === ReviewDecision.MAYBE
                                    ? "selected_maybe"
                                    : "maybe"}
                                bind:isSubmittingReview
                            />
                        {/if}
                        <PaperDecisionButton
                            projectPaperId={paper.id}
                            {userReview}
                            variant={userReview?.decision === ReviewDecision.ACCEPTED
                                ? "selected_accept"
                                : "accept"}
                            bind:isSubmittingReview
                        />
                    </div>
                {/await}
            {/if}
            <PaperNavigationButton direction="right" href="" />
        </div>
    {/if}
</main>
