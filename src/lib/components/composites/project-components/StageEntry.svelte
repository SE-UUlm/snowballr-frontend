<script lang="ts">
    import PaperListEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";
    import * as Accordion from "$lib/components/primitives/accordion";
    import Button from "$lib/components/primitives/button/button.svelte";
    import type { Project_Paper } from "$lib/model/api/project";
    import type { Stage } from "$lib/model/general";
    import { pluralize } from "$lib/utils/common-helper";
    import { filterProjectPapers } from "$lib/utils/filters";
    import CirclePlus from "lucide-svelte/icons/circle-plus";

    interface Props {
        projectId: string;
        stage: Stage;
        selectedPaper?: Project_Paper;
        searchText?: string;
    }

    let {
        projectId,
        stage,
        selectedPaper = $bindable(undefined),
        searchText = "",
    }: Props = $props();

    let filteredPapers = $derived(
        searchText ? filterProjectPapers(stage.papers ?? [], searchText) : (stage.papers ?? []),
    );

    let totalPaperCount = $derived(stage.papers?.length ?? 0);
</script>

<!--
@component
Accordion entry for a stage in the project paper list. It displays the stage number and the number of papers in the stage.
It also displays the number of papers that match the search criteria if a search text is provided.
It contains a button to add a paper to the stage and a list of papers in the stage.

Usage:
```svelte
    <StageEntry {projectId} {stage} {searchText} bind:selectedPaper />
```
-->
<Accordion.Item value={`stage-${stage.stageIndex}`}>
    <!-- TODO: Add amount of filtered/all e.g. (3/7) -->
    <Accordion.Trigger data-testid="stage-entry-trigger">
        <div class="flex w-full flex-row justify-between">
            <span>Stage {stage.stageIndex}</span>
            {#if searchText}
                <span>
                    ({filteredPapers.length} / {totalPaperCount}
                    {pluralize(totalPaperCount, "paper", "papers")})
                </span>
            {:else}
                <span>({totalPaperCount} {pluralize(stage.papers, "paper", "papers")})</span>
            {/if}
        </div>
    </Accordion.Trigger>
    <Accordion.Content>
        <div class="flex flex-col gap-4 pl-5">
            {#if filteredPapers.length > 0}
                {#each filteredPapers as paper (paper.id)}
                    <PaperListEntry
                        onClick={() => {
                            selectedPaper = paper;
                        }}
                        {paper}
                        {projectId}
                    />
                {/each}
            {:else if searchText && totalPaperCount > 0}
                <span class="text-hint italic">
                    No papers match your search criteria in this stage.
                </span>
            {:else if totalPaperCount === 0}
                <span class="text-hint italic">No papers currently in this stage.</span>
            {/if}

            <Button
                onclick={() => {
                    // TODO: This is done in https://github.com/SE-UUlm/snowballr-frontend/issues/35
                    console.log(`Add paper to stage ${stage.stageIndex}`);
                }}
            >
                <CirclePlus strokeWidth="2.5" />
                Add Paper
            </Button>
        </div>
    </Accordion.Content>
</Accordion.Item>
