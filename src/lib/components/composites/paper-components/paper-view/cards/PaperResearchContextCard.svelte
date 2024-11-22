<script lang="ts">
    import PaperCard from "./PaperCard.svelte";
    import PaperCardContent from "./PaperCardContent.svelte";

    const tabs = [
        { value: "1", label: "References/Citations" },
        { value: "2", label: "Review Information" },
    ];
</script>

<!--
@component
Paper Card for paper research context in the Paper View component.

Usage:
```svelte
<PaperResearchContextCard />
```
-->
<PaperCard {tabs}>
    <PaperCardContent value="1">
        <span
            >Will be implemented in <a
                class="text-blue-400"
                href="https://github.com/SE-UUlm/snowballr-frontend/issues/42">#42</a
            >.</span
        >
    </PaperCardContent>
    <PaperCardContent value="2">
        <span
            >Will be implemented in <a
                class="text-blue-400"
                href="https://github.com/SE-UUlm/snowballr-frontend/issues/45">#45</a
            >.</span
        >
    </PaperCardContent>
</PaperCard>
