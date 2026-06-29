<script lang="ts">
    import { Project } from "$api/project";
    import type { FetcherInformation } from "$api/fetcher";
    import Plus from "@lucide/svelte/icons/plus";
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
    className="w-full sm:w-40"
    {disabled}
    {fetcher}
    label="Add Fetcher"
    loadingLabel="Adding Fetcher"
    {onProjectChanged}
    {project}
    title={`Add ${fetcher.name} Fetcher`}
    triggerVariant="default"
>
    {#snippet trigger()}
        <Plus />
    {/snippet}
</FetcherChangeDialog>
