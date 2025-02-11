<script lang="ts">
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
        Omit<ReviewCriteriaListProps, "inReviewMode">;

    let {
        inReviewMode,
        backwardReferencedPapers,
        forwardReferencedPapers,
        reviewers,
        reviewedCriteria,
    }: PaperResearchContextCardProps = $props();

    const tabs = inReviewMode
        ? [
              { value: "1", label: "Review Information" },
              { value: "2", label: "Forward/Backward References" },
          ]
        : [
              { value: "1", label: "Forward/Backward References" },
              { value: "2", label: "Review Information" },
          ];
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
        {#if inReviewMode}
            <ReviewCriteriaList {inReviewMode} {reviewedCriteria} {reviewers} />
            <Separator />
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
            <ReferencesAndCitationsCardContent
                {backwardReferencedPapers}
                {forwardReferencedPapers}
            />
        {/if}
    </PaperCardContent>
    <PaperCardContent value="2">
        {#if inReviewMode}
            <ReferencesAndCitationsCardContent
                {backwardReferencedPapers}
                {forwardReferencedPapers}
            />
        {:else}
            <ReviewCriteriaList {inReviewMode} {reviewedCriteria} {reviewers} />
            <Separator />
            <span>Final decision</span>
        {/if}
    </PaperCardContent>
</PaperCard>
