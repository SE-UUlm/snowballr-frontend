<script lang="ts">
    import { Project } from "$api/project";
    import SquarePen from "@lucide/svelte/icons/square-pen";
    import type { FetcherInformation } from "$api/fetcher";
    import FetcherChangeDialog from "./FetcherChangeDialog.svelte";

    interface Props {
        project: Project;
        fetcher: FetcherInformation;
        onProjectChanged: (project: Project) => void;
        disabled: boolean;
    }

    let { project, fetcher, onProjectChanged, disabled }: Props = $props();
</script>

<FetcherChangeDialog
    className="w-full sm:w-38"
    {disabled}
    {fetcher}
    label="Save Options"
    loadingLabel="Saving Options"
    {onProjectChanged}
    {project}
    title={`Edit ${fetcher.name} Fetcher Options`}
    triggerVariant="ghost"
>
    {#snippet trigger()}
        <SquarePen />
    {/snippet}
</FetcherChangeDialog>
