<script lang="ts">
    import PaperCard from "./PaperCard.svelte";
    import PaperCardContent from "./PaperCardContent.svelte";
    import ReferencesAndCitationsCardContent, {
        type ReferencesAndCitationsCardContentProps,
    } from "./ReferencesAndCitationsCardContent.svelte";

    let {
        backwardReferencedPapers,
        forwardReferencedPapers,
    }: ReferencesAndCitationsCardContentProps = $props();

    const tabs = [
        { value: "1", label: "Review Criteria" },
        { value: "2", label: "References/Citations" },
    ];
</script>

<!--
@component
Paper Card for paper review information in the Paper View component.

Usage:
```svelte
    <PaperReviewCard {backwardReferencedPapers} {forwardReferencedPapers} />
```
-->
<PaperCard {tabs}>
    <PaperCardContent value="1">
        <span>
            Will be implemented in
            <a class="text-blue-400" href="https://github.com/SE-UUlm/snowballr-frontend/issues/53">
                #53
            </a>
            .
        </span>
    </PaperCardContent>
    <PaperCardContent value="2">
        <ReferencesAndCitationsCardContent {backwardReferencedPapers} {forwardReferencedPapers} />
    </PaperCardContent>
</PaperCard>
