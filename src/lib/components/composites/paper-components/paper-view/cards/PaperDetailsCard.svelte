<script lang="ts">
    import PaperCard from "./PaperCard.svelte";
    import PaperCardContent from "./PaperCardContent.svelte";

    const tabs = [
        { value: "1", label: "Information" },
        { value: "2", label: "Document" },
    ];
</script>

<!--
@component
Paper Card for paper details in the Paper View component.

Usage:
```svelte
<PaperDetailsCard />
```
-->
<PaperCard {tabs}>
    <PaperCardContent value="1">
        <span
            >Will be implemented in <a
                class="text-blue-400"
                href="https://github.com/SE-UUlm/snowballr-frontend/issues/41">#41</a
            >.</span
        >
    </PaperCardContent>
    <PaperCardContent value="2">
        <span
            >Will be implemented in <a
                class="text-blue-400"
                href="https://github.com/SE-UUlm/snowballr-frontend/issues/98">#98</a
            >.</span
        >
    </PaperCardContent>
</PaperCard>
