<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";
    import PaperDetailsCard from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCard.svelte";
    import PaperResearchContextCard, {
        type NonProjectResearchContextCardProps,
        type ProjectResearchContextCardProps,
    } from "$lib/components/composites/paper-components/paper-view/cards/PaperResearchContextCard.svelte";
    import type { CriterionWithReviews } from "$lib/model/general";
    import PaperBookmarkButton from "../../PaperBookmarkButton.svelte";
    import AcceptButton from "./decision-buttons/AcceptButton.svelte";
    import DeclineButton from "./decision-buttons/DeclineButton.svelte";
    import MaybeButton from "./decision-buttons/MaybeButton.svelte";
    import PaperNavigationButton from "./PaperNavigationButton.svelte";
    import type { User } from "$lib/model/api/user";
    import type { Paper } from "$lib/model/api/paper";
    import type { Project, Project_Paper } from "$lib/model/api/project";
    import type { ReferencesAndCitationsCardContentProps } from "./cards/ReferencesAndCitationsCardContent.svelte";
    import { asPaper } from "$lib/utils/model-helper";
    import { reviewMode } from "$lib/global-state/review-mode-state.svelte";
    import { getDisplayPaperId } from "$lib/utils/common-helper";

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
    }: PaperViewProps = $props();

    const loadingPaper = loadingPaperWrapper.then(asPaper);
    const loadingPaperId = loadingPaper.then((paper) => paper.id);
    // as the navigation bar shows either the paper id or the local / relative id, if the paper
    // is a project paper, the id for the navigation bar must be handled differently
    const loadingPaperIdForNavigationBar = loadingPaperWrapper.then((paper) =>
        getDisplayPaperId(paper),
    );

    // svelte-ignore non_reactive_update
    let researchContextCardProps:
        | ProjectResearchContextCardProps
        | NonProjectResearchContextCardProps;
    // Statically define props, so that the type can be inferred when passing it to `PaperResearchContextCard`.
    // Note: this is ugly, but otherwise the types of these properties can't be inferred.
    if (reviewers) {
        // This now of type `ProjectResearchContextCardProps`
        researchContextCardProps = {
            reviewers,
            criteriaWithReviews,
            loadingProjectPaper: loadingPaperWrapper,
        };
    } else {
        // This is now of type `NonProjectResearchContextCardProps`
        researchContextCardProps = {
            reviewers,
            criteriaWithReviews,
            loadingProjectPaper: loadingPaperWrapper,
        };
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
<div class="flex h-fit w-full flex-row justify-between gap-4">
    <PaperNavigationBar
        {backRef}
        {loadingPaper}
        loadingPaperId={loadingPaperIdForNavigationBar}
        {user}
    />
    <!-- TODO: Set `isBookmarkedDefault` as soon as endpoint is available -->
    <PaperBookmarkButton isBookmarkedDefault={false} {loadingPaperId} />
</div>
<main class="flex h-full w-full flex-col gap-5 px-2 py-4">
    <div class="flex h-full w-full flex-row gap-5">
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
            {#if reviewMode.isActivated}
                {#if loadingProject}
                    {#await loadingProject}
                        <!-- show nothing while loading -->
                    {:then project}
                        <!-- flex grow is very high so that it grows first, before the navigation buttons do -->
                        <!-- max-width is max-width of buttons + gap, which is the reason why they have fixed values -->
                        <div class="flex max-w-[62rem] flex-grow-1000 justify-center gap-4">
                            <DeclineButton {loadingPaperId} />
                            {#if project.settings?.reviewMaybeAllowed}
                                <MaybeButton {loadingPaperId} />
                            {/if}
                            <AcceptButton {loadingPaperId} />
                        </div>
                    {/await}
                {/if}
            {/if}
            <PaperNavigationButton direction="right" href="" />
        </div>
    {/if}
</main>
