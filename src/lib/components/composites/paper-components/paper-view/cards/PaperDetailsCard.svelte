<script lang="ts">
    import PaperCard from "./PaperCard.svelte";
    import PaperCardContent from "./PaperCardContent.svelte";
    import type { Paper } from "$lib/model/api/paper";
    import PaperDetailsCardContent from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCardContent.svelte";

    interface Props {
        loadingPaper: Promise<Paper>;
        allowEditModeToggle: boolean;
        startInEditMode: boolean;
    }

    const { loadingPaper, allowEditModeToggle, startInEditMode }: Props = $props();

    const tabs = [
        { value: "1", label: "Information" },
        { value: "2", label: "Document" },
    ];
</script>

<!--
@component
`PaperCard` for displaying the details of a paper in the `PaperView` component.

Usage:
```svelte
    <PaperDetailsCard {paper} {allowEditModeToggle} {startInEditMode} />
```
-->
<PaperCard data-testid="paper-details-card" {tabs}>
    <PaperCardContent value="1">
        <PaperDetailsCardContent {allowEditModeToggle} {loadingPaper} {startInEditMode} />
    </PaperCardContent>
    <PaperCardContent value="2">
        <span>
            Will be implemented in
            <a class="text-blue-400" href="https://github.com/SE-UUlm/snowballr-frontend/issues/98">
                #98
            </a>
            .
        </span>
    </PaperCardContent>
</PaperCard>
