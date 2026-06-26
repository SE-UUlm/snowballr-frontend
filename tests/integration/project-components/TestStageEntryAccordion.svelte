<script lang="ts">
    import StageEntry from "$lib/components/composites/project-components/StageEntry.svelte";
    import * as Accordion from "$lib/components/primitives/accordion";
    import { type Project_Paper } from "$api/project";
    import type { Stage } from "$lib/model/general";
    import { createProject, loading } from "$tests/model-builder";

    interface Props {
        projectId: string;
        stage: Stage;
        selectedPaper?: Project_Paper;
    }

    let { projectId, stage, selectedPaper = $bindable(undefined) }: Props = $props();
</script>

<!--
@component
`Accordion.Item` always needs to be inside `Accordion.Root`. To test `StageEntry`, one can use this wrapper.
-->
<Accordion.Root type="multiple">
    <StageEntry loadingProject={loading(createProject())} {projectId} {stage} bind:selectedPaper />
</Accordion.Root>
