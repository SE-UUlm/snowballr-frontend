<script lang="ts">
    import PaperListEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";
    import * as Accordion from "$lib/components/primitives/accordion";
    import Button from "$lib/components/primitives/button/button.svelte";
    import type { Project_Paper } from "$api/project";
    import type { ProjectPaperFilter, Stage } from "$lib/model/general";
    import { pluralize } from "$lib/utils/common-helper";
    import { filterProjectPapers } from "$lib/utils/filters";
    import CirclePlus from "@lucide/svelte/icons/circle-plus";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import AddPaperDialogButton from "./AddPaperDialogButton.svelte";

    interface Props {
        projectId: string;
        stage: Stage;
        selectedPaper?: Project_Paper;
        filter?: ProjectPaperFilter;
        searchText?: string;
    }

    let {
        projectId,
        stage,
        selectedPaper = $bindable(undefined),
        filter = undefined,
        searchText = undefined,
    }: Props = $props();

    let filteredPapers = $derived(filterProjectPapers(stage.papers ?? [], filter, searchText));

    let totalPaperCount = $derived(stage.papers?.length ?? 0);

    let { isProjectArchived } = $derived(getIsProjectArchivedContext());
</script>

<!--
@component
Accordion entry for a stage in the project paper list. It displays the stage number and
the number of papers in the stage. It also displays the number of papers that match the search
and filter criteria if either a search text or a set of filters or both are provided.
It contains a button to add a paper to the stage and a list of papers in the stage.

Usage:
```svelte
    <StageEntry filter={papersFilters} {projectId} {stage} {searchText} bind:selectedPaper />
```
-->
<Accordion.Item value={`stage-${stage.stageIndex}`}>
    <Accordion.Trigger data-testid="stage-entry-trigger">
        <div class="flex w-full flex-row justify-between">
            <span>Stage {stage.stageIndex}</span>
            {#if filteredPapers.length < totalPaperCount}
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
            {:else if totalPaperCount > 0}
                <span class="text-hint italic">
                    No papers in this stage match your search or filter.
                </span>
            {:else if totalPaperCount === 0}
                <span class="text-hint italic">No papers are currently in this stage.</span>
            {/if}

            {#if !isProjectArchived}
                <Button href={`/project/${projectId}/paper/new?stage=${stage.stageIndex}`}>
                    <CirclePlus strokeWidth="2.5" /> Add New Paper
                </Button>
                <AddPaperDialogButton {projectId} stage={stage.stageIndex} />
            {/if}
        </div>
    </Accordion.Content>
</Accordion.Item>
