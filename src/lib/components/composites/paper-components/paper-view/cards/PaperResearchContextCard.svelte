<script lang="ts">
    import PaperDecisionBanner, {
        type PaperDecisionBannerProps,
    } from "$lib/components/composites/criteria/PaperDecisionBanner.svelte";
    import { Separator } from "$lib/components/primitives/separator";
    import type { Paper } from "$api/paper";
    import PaperCard from "$lib/components/composites/paper-components/paper-view/cards/PaperCard.svelte";
    import PaperCardContent from "$lib/components/composites/paper-components/paper-view/cards/PaperCardContent.svelte";
    import ReferencesCardContent from "$lib/components/composites/paper-components/paper-view/cards/ReferencesCardContent.svelte";
    import ReviewCriteriaList, {
        type ReviewCriteriaListProps,
    } from "$lib/components/composites/paper-components/paper-view/cards/ReviewCriteriaList.svelte";
    import { reviewMode } from "$lib/global-state/review-mode-state.svelte";

    export type ProjectResearchContextCardProps = ReviewCriteriaListProps &
        PaperDecisionBannerProps;

    export interface NonProjectResearchContextCardProps {
        loadingProjectPaper: Promise<Paper>;
        reviewers: undefined;
        criteriaWithReviews: undefined;
    }

    export interface ForwardAndBackwardReferencesCardContentProps {
        backwardReferencedPapers: Promise<Paper[]>;
        forwardReferencedPapers: Promise<Paper[]>;
    }

    export type PaperResearchContextCardProps = ForwardAndBackwardReferencesCardContentProps &
        (ProjectResearchContextCardProps | NonProjectResearchContextCardProps);

    const {
        backwardReferencedPapers,
        forwardReferencedPapers,
        reviewers,
        criteriaWithReviews,
        loadingProjectPaper,
    }: PaperResearchContextCardProps = $props();

    const reviewInfoTab = { value: "1", label: "Review Information" };
    const forwardReferencesTab = { value: "2", label: "Backward References" };
    const backwardReferencesTab = { value: "3", label: "Forward References" };
    const referencesTabs = [backwardReferencesTab, forwardReferencesTab];

    const tabs = $derived(
        reviewers
            ? reviewMode.isActivated
                ? [reviewInfoTab, ...referencesTabs]
                : [...referencesTabs, reviewInfoTab]
            : referencesTabs,
    );
</script>

<!--
@component
`PaperCard` for displaying the review information and forward/backward references of a paper in the `PaperView` component.

Usage:
```svelte
    <PaperResearchContextCard
        {backwardReferencedPapers}
        {forwardReferencedPapers}
        {loadingProjectPaper}
        {reviewedCriteria}
        {reviewers}
    />
```
-->
<PaperCard {tabs}>
    <PaperCardContent value="1">
        {#if reviewers !== undefined}
            <ReviewCriteriaList {criteriaWithReviews} {reviewers} />
            {#if reviewMode.isActivated}
                <span>
                    Will be implemented in
                    <a
                        class="text-blue-400"
                        href="https://github.com/SE-UUlm/snowballr-frontend/issues/55"
                    >
                        #53
                    </a>
                    .
                </span>
            {:else}
                <Separator />
                <div class="md:px-8 lg:px-15">
                    <PaperDecisionBanner {loadingProjectPaper} {reviewers} />
                </div>
            {/if}
        {/if}
    </PaperCardContent>
    <PaperCardContent value="2">
        <ReferencesCardContent
            loadingReferencedPapers={backwardReferencedPapers}
            title="Backward References"
        />
    </PaperCardContent>
    <PaperCardContent value="3">
        <ReferencesCardContent
            loadingReferencedPapers={forwardReferencedPapers}
            title="Forward References"
        />
    </PaperCardContent>
</PaperCard>
