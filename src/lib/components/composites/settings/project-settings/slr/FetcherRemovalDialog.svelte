<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import Alert from "$lib/components/composites/utils/Alert.svelte";
    import { Project, Project_Settings } from "$lib/model/api/project";
    import type { ApiError } from "$lib/model/general";
    import { updateFetchers } from "./UpdateFetchers";

    interface Props {
        projectId: string;
        projectSettings?: Project_Settings;
        fetcher: string;
        onProjectChanged: (project: Project) => void;
        open: boolean;
    }

    let {
        projectId,
        projectSettings,
        onProjectChanged,
        fetcher,
        open = $bindable(),
    }: Props = $props();

    let error: ApiError | undefined = $state();

    // remove the fetcher (fetcher) from the project (projectId)
    async function removeFetcher() {
        const updatedFetcherApis = projectSettings?.fetchers ?? {};
        delete updatedFetcherApis[fetcher];
        await updateFetchers(projectId, updatedFetcherApis, onProjectChanged, (it) => (error = it));
    }
</script>

<AlertDialog
    actionButtonText="Delete"
    actionProps={{
        variant: "destructive",
        onclick: () => {
            removeFetcher();
            open = false;
        },
    }}
    cancelButtonText="Cancel"
    title={`Remove "${fetcher}" Fetcher`}
    bind:open
>
    {#snippet description()}
        <p>
            Removing the fetcher also irreversibly removes the values of the options you may have
            configured.
        </p>

        {#if error}
            <Alert details={error.errorDetails} title={error.errorTitle} variant="error" />
        {/if}
    {/snippet}
</AlertDialog>
