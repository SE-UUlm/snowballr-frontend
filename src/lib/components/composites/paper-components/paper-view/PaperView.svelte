<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";
    import PaperDetailsCard from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCard.svelte";
    import PaperResearchContextCard, {
        type NonProjectResearchContextCardProps,
        type ProjectResearchContextCardProps,
    } from "$lib/components/composites/paper-components/paper-view/cards/PaperResearchContextCard.svelte";
    import type { CriterionWithReviews } from "$lib/model/general";
    import PaperBookmarkButton from "$lib/components/composites/button/PaperBookmarkButton.svelte";
    import type { User } from "$lib/model/api/user";
    import type { Paper } from "$lib/model/api/paper";
    import type { Project, Project_Paper } from "$lib/model/api/project";
    import type { ReferencesAndCitationsCardContentProps } from "./cards/ReferencesAndCitationsCardContent.svelte";
    import { asPaper, asProjectPaper, isProjectPaper } from "$lib/utils/model-helper";
    import { getDisplayPaperId } from "$lib/utils/common-helper";
    import {
        setAlreadyReviewedContext,
        setSelectedReviewCriteriaContext,
    } from "$lib/utils/custom-context";
    import { type Review } from "$lib/model/api/review";
    import { toast } from "svelte-sonner";
    import { UserContextKey, type UserContext } from "$lib/current-user/userContext";
    import { getContext } from "svelte";
    import { projectPaperLoading } from "$lib/global-state/project-paper-loading-state.svelte";
    import ButtonBar from "$lib/components/composites/paper-components/paper-view/ButtonBar.svelte";

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
        showButtonBar?: boolean;
        backRef: string;
        allowEditModeToggle?: boolean;
        startInEditMode?: boolean;
    };

    export type PaperViewProps = IndependentPaperViewProps &
        (ProjectPaperViewProps | NonProjectPaperViewProps);

    const data: PaperViewProps = $props();
    const {
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

    const user = getContext<UserContext>(UserContextKey)();

    const loadingPaper = $derived.by(() => loadingPaperWrapper.then(asPaper));
    const loadingProjectPaper = $derived.by(() =>
        loadingPaperWrapper.then(asProjectPaper).catch(() => undefined),
    );
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

    let userReview: Review | undefined = $state(undefined);

    /**
     * Makes sure that all necessary resources are loaded.
     */
    $effect(() => {
        (async () => {
            projectPaperLoading.isLoading = true;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const promises: Promise<any>[] = [
                loadingPaperId,
                loadingPaperIdForNavigationBar,
                loadingPaperWrapper,
                loadingPaper,
                loadingProjectPaper,
                forwardReferencedPapers,
                backwardReferencedPapers,
                getUserReviewIfAlreadySubmitted().then((review) => {
                    userReview = review;
                }),
            ];

            if (loadingProject) promises.push(loadingProject);
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
            const paper = await loadingPaperWrapper;
            if (!isProjectPaper(paper)) {
                return undefined;
            }
            const projectPaper = asProjectPaper(paper)!;
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
Whole page component to display information about a paper.
In the bottom, there are buttons to accept, decline or mark the paper as undecided.
Additionally, there are buttons to navigate to the previous or next paper.

- when `showButtonBar` is false, then no buttons are shown at the bottom of the page

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
    <PaperNavigationBar {backRef} {loadingPaper} loadingPaperId={loadingPaperIdForNavigationBar} />
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
        <ButtonBar {loadingProject} {loadingProjectPaper} bind:userReview />
    {/if}
</main>
