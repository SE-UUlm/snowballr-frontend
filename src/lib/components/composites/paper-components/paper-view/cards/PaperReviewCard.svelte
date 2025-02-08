<script lang="ts">
    import PaperCard from "./PaperCard.svelte";
    import PaperCardContent from "./PaperCardContent.svelte";
    import ReferencesAndCitationsCardContent from "./ReferencesAndCitationsCardContent.svelte";
    import type { Paper } from "$lib/model/api/paper";

    interface Props {
        projectId?: string;
        loadingPaper: Promise<Paper>;
    }

    let { projectId, loadingPaper }: Props = $props();

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
    <PaperReviewCard {projectId} {loadingPaper} />
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
        <ReferencesAndCitationsCardContent {projectId} {loadingPaper} />
    </PaperCardContent>
</PaperCard>
