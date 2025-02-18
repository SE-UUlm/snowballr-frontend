<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";
    import PaperDetailsCard from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCard.svelte";
    import PaperResearchContextCard from "$lib/components/composites/paper-components/paper-view/cards/PaperResearchContextCard.svelte";
    import PaperBookmarkButton from "../../PaperBookmarkButton.svelte";
    import AcceptButton from "./decision-buttons/AcceptButton.svelte";
    import DeclineButton from "./decision-buttons/DeclineButton.svelte";
    import MaybeButton from "./decision-buttons/MaybeButton.svelte";
    import PaperNavigationButton from "./PaperNavigationButton.svelte";
    import type { User } from "$lib/model/api/user";
    import type { Paper } from "$lib/model/api/paper";
    import type { Project_Paper } from "$lib/model/api/project";
    import { asPaper } from "$lib/model/general";
    import type { ReferencesAndCitationsCardContentProps } from "./cards/ReferencesAndCitationsCardContent.svelte";

    type Props = ReferencesAndCitationsCardContentProps & {
        user: User;
        loadingPaper: Promise<Project_Paper | Paper>;
        showButtonBar?: boolean;
        backRef: string;
        userConfig: {
            isReviewMode: boolean;
            showMaybeButton: boolean;
        };
        allowEditModeToggle?: boolean;
        startInEditMode?: boolean;
    };

    const {
        user,
        loadingPaper: initialLoadingPaper,
        backwardReferencedPapers,
        forwardReferencedPapers,
        showButtonBar = false,
        backRef,
        userConfig,
        allowEditModeToggle = false,
        startInEditMode = false,
    }: Props = $props();

    const loadingPaper = initialLoadingPaper.then(asPaper);
    const loadingPaperId = loadingPaper.then((paper) => paper.id);
</script>

<!--
@component
Whole page component to display information about a paper.
In the bottom, there are buttons to accept, decline or mark the paper as undecided.
Additionally, there are buttons to navigate to the previous or next paper.

- when `showButtonBar` is false, then no buttons are shown at the bottom of the page
- when `userConfig.isReviewMode` is false, then no decision buttons are shown
- when `userConfig.showMaybeButton` is false, then the maybe button is not shown

Edit Mode:
- in the edit mode, the user can edit the paper details. When the mode is turned off, the details are displayed as read-only.
- when `allowEditModeToggle` is true, then the user can toggle the edit mode
- when `startInEditMode` is true, then the paper details can be edited from the start

Usage:
```svelte
    <PaperView
        user={user}
        loadingPaper={loadingPaper}
        backwardReferencedPapers={backwardReferencedPapers}
        forwardReferencedPapers={forwardReferencedPapers}
        showButtonBar
        backRef="/"
        userConfig={{
            isReviewMode: true,
            showMaybeButton: true,
        }}
        allowEditModeToggle
        startInEditMode
    />
```
-->
<div class="flex flex-row justify-between h-fit w-full gap-4">
    <PaperNavigationBar {user} {backRef} {loadingPaper} />
    <!-- TODO: Set `isBookmarkedDefault` as soon as endpoint is available -->
    <PaperBookmarkButton {loadingPaperId} isBookmarkedDefault={false} />
</div>
<main class="flex flex-col h-full w-full px-2 py-4 gap-5">
    <div class="flex flex-row w-full h-full gap-5">
        <PaperDetailsCard {loadingPaper} {allowEditModeToggle} {startInEditMode} />
        <PaperResearchContextCard
            inReviewMode={userConfig.isReviewMode}
            {backwardReferencedPapers}
            {forwardReferencedPapers}
        />
    </div>
    {#if showButtonBar}
        <div class="flex flex-row w-full h-fit justify-between gap-4" data-testid="button-bar">
            <!-- TODO: Implementation of navigation buttons will be done in #46 and #47 -->
            <PaperNavigationButton direction="left" href="" />
            {#if userConfig.isReviewMode}
                <!-- flex grow is very high so that it grows first, before the navigation buttons do -->
                <!-- max-width is max-width of buttons + gap, which is the reason why they have fixed values -->
                <div class="flex flex-grow-1000 max-w-[62rem] gap-[1rem] justify-center">
                    <DeclineButton {loadingPaperId} />
                    {#if userConfig.showMaybeButton}
                        <MaybeButton {loadingPaperId} />
                    {/if}
                    <AcceptButton {loadingPaperId} />
                </div>
            {/if}
            <PaperNavigationButton direction="right" href="" />
        </div>
    {/if}
</main>
