<script lang="ts">
    import PaperDecisionBanner, {
        type PaperDecisionBannerProps,
    } from "$lib/components/composites/criteria/PaperDecisionBanner.svelte";
    import { Separator } from "$lib/components/primitives/separator";
    import PaperCard from "./PaperCard.svelte";
    import PaperCardContent from "./PaperCardContent.svelte";
    import ReferencesAndCitationsCardContent, {
        type ReferencesAndCitationsCardContentProps,
    } from "./ReferencesAndCitationsCardContent.svelte";
    import ReviewCriteriaList, { type ReviewCriteriaListProps } from "./ReviewCriteriaList.svelte";

    export type PaperResearchContextCardProps = {
        inReviewMode: boolean;
    } & ReferencesAndCitationsCardContentProps &
        Omit<ReviewCriteriaListProps, "inReviewMode"> &
        PaperDecisionBannerProps;

    let {
        inReviewMode,
        backwardReferencedPapers,
        forwardReferencedPapers,
        reviewers,
        reviewedCriteria,
        loadingProjectPaper,
    }: PaperResearchContextCardProps = $props();

    const reviewInfoTab = { value: "1", label: "Review Information" };
    const referencesTab = { value: "2", label: "Forward/Backward References" };

    const tabs = inReviewMode ? [reviewInfoTab, referencesTab] : [referencesTab, reviewInfoTab];
</script>

<!--
@component
`PaperCard` for displaying the review information and forward/backward references of a paper in the `PaperView` component.

Usage:
```svelte
    <PaperResearchContextCard {inReviewMode} {backwardReferencedPapers} {forwardReferencedPapers} />
```
-->
<PaperCard {tabs}>
    <PaperCardContent value="1">
        <ReviewCriteriaList {inReviewMode} {reviewedCriteria} {reviewers} />
        <Separator />
        {#if inReviewMode}
            <span>
                Will be implemented in
                <a
                    class="text-blue-400"
                    href="https://github.com/SE-UUlm/snowballr-frontend/issues/53"
                >
                    #53
                </a>
                .
            </span>
        {:else}
            <div class="px-15">
                <PaperDecisionBanner {loadingProjectPaper} {reviewers} />
            </div>
        {/if}
    </PaperCardContent>
    <PaperCardContent value="2">
        <ReferencesAndCitationsCardContent {backwardReferencedPapers} {forwardReferencedPapers} />
    </PaperCardContent>
</PaperCard>
