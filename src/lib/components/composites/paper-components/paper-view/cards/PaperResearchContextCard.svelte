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
        { value: "1", label: "Forward/Backward References" },
        { value: "2", label: "Review Information" },
    ];
</script>

<!--
@component
Paper Card for paper research context in the Paper View component.

Usage:
```svelte
    <PaperResearchContextCard {backwardReferencedPapers} {forwardReferencedPapers} />
```
-->
<PaperCard {tabs}>
    <PaperCardContent value="1">
        <ReferencesAndCitationsCardContent {backwardReferencedPapers} {forwardReferencedPapers} />
    </PaperCardContent>
    <PaperCardContent value="2">
        <span>
            Will be implemented in
            <a class="text-blue-400" href="https://github.com/SE-UUlm/snowballr-frontend/issues/45">
                #45
            </a>
            .
        </span>
    </PaperCardContent>
</PaperCard>
