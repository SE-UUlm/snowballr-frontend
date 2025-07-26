<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";
    import PaperDetailsCard from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCard.svelte";
    import PaperResearchContextCard, {
        type NonProjectResearchContextCardProps,
        type ProjectResearchContextCardProps,
        type ForwardAndBackwardReferencesCardContentProps,
    } from "$lib/components/composites/paper-components/paper-view/cards/PaperResearchContextCard.svelte";
    import type { CriterionWithReviews } from "$lib/model/general";
    import PaperBookmarkButton from "$lib/components/composites/button/PaperBookmarkButton.svelte";
    import type { User } from "$lib/model/api/user";
    import { Paper } from "$lib/model/api/paper";
    import type { Project_Paper } from "$lib/model/api/project";
    import { asPaper } from "$lib/utils/model-helper";
    import { getDisplayPaperId } from "$lib/utils/common-helper";
    import { type Snippet } from "svelte";

    export interface ProjectSpecificPaperViewProps {
        loadingPaper: Promise<Project_Paper>;
        reviewers: Promise<User[]>;
        criteriaWithReviews: Promise<CriterionWithReviews[]>;
    }

    export interface NonProjectPaperViewProps {
        loadingPaper: Promise<Paper>;
        reviewers: undefined;
        criteriaWithReviews: undefined;
    }

    export type IndependentPaperViewProps = ForwardAndBackwardReferencesCardContentProps & {
        backRef: string;
        allowEditModeToggle?: boolean;
        startInEditMode?: boolean;
        bottomBar?: Snippet;
    };

    export type PaperViewProps = IndependentPaperViewProps &
        (ProjectSpecificPaperViewProps | NonProjectPaperViewProps);

    const {
        backwardReferencedPapers,
        forwardReferencedPapers,
        backRef,
        allowEditModeToggle = false,
        startInEditMode = false,
        loadingPaper: loadingPaperWrapper,
        reviewers,
        criteriaWithReviews,
        bottomBar = undefined,
    }: PaperViewProps = $props();

    let paper: Paper = $state(Paper.create());

    const loadingPaper = loadingPaperWrapper.then((wrapper) => {
        const loadedPaper = asPaper(wrapper);
        paper = loadedPaper;
        return loadedPaper;
    });
    const loadingPaperId = loadingPaper.then((paper) => paper.id);
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
</script>

<!--
@component
Whole page component to display information about a paper.

Edit Mode:
- in the edit mode, the user can edit the paper details. When the mode is turned off, the details are displayed as read-only.
- when `allowEditModeToggle` is true, then the user can toggle the edit mode
- when `startInEditMode` is true, then the paper details can be edited from the start

Usage:
```svelte
    <PaperView
        {loadingPaper}
        {backwardReferencedPapers}
        {forwardReferencedPapers}
        {reviewers}
        {criteriaWithReviews}
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
        <PaperDetailsCard {allowEditModeToggle} {loadingPaper} {startInEditMode} bind:paper />
        <PaperResearchContextCard
            {backwardReferencedPapers}
            {forwardReferencedPapers}
            {...researchContextCardProps}
        />
    </div>
    {@render bottomBar?.()}
</main>
