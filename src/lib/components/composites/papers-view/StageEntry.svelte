<script lang="ts">
    import PaperListEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";
    import * as Accordion from "$lib/components/primitives/accordion/index.js";
    import Button from "$lib/components/primitives/button/button.svelte";
    import type { Project_Paper } from "$lib/model/api/project";
    import type { Stage } from "$lib/model/general";
    import { pluralize } from "$lib/utils/common-helper";
    import CirclePlus from "lucide-svelte/icons/circle-plus";

    interface Props {
        projectId: string;
        stage: Stage;
        selectedPaper?: Project_Paper;
    }

    let { projectId, stage, selectedPaper = $bindable(undefined) }: Props = $props();
</script>

<Accordion.Item value={`stage-${stage.stageIndex}`}>
    <!-- TODO: Add amount of filtered/all e.g. (3/7) -->
    <Accordion.Trigger data-testid="stage-entry-trigger">
        <div class="flex flex-row w-full justify-between">
            <span>Stage {stage.stageIndex}</span>
            <span>({stage.papers.length} {pluralize(stage.papers.length, "paper", "papers")})</span>
        </div>
    </Accordion.Trigger>
    <Accordion.Content>
        <div class="flex flex-col pl-5 gap-4">
            {#each stage.papers as paper (paper.id)}
                <PaperListEntry
                    onClick={() => {
                        selectedPaper = paper;
                    }}
                    {paper}
                    {projectId}
                    showReviewStatus
                />
            {/each}
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
