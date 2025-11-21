<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import Alert from "$lib/components/composites/utils/Alert.svelte";
    import type { ActionError } from "$lib/model/action-error";
    import { Project, Project_Settings } from "$lib/model/api/project";
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

    let removeFetcherError: ActionError = $state(undefined);
    let loading = $state(false);

    // remove the fetcher (fetcher) from the project (projectId)
    async function removeFetcher() {
        loading = true;
        const updatedFetcherApis = projectSettings?.fetchers ?? {};
        delete updatedFetcherApis[fetcher];
        await updateFetchers(
            projectId,
            updatedFetcherApis,
            (project) => {
                onProjectChanged(project);
                open = false;
            },
            (it) => (removeFetcherError = it),
        );
        loading = false;
    }
</script>

<AlertDialog
    actionButtonLoadingText="Removing Fetcher"
    actionButtonText="Remove Fetcher"
    actionProps={{
        variant: "destructive",
        onclick: removeFetcher,
        class: "w-42",
    }}
    cancelButtonText="Cancel"
    cancelProps={{
        disabled: loading,
    }}
    {loading}
    title={`Remove "${fetcher}" Fetcher`}
    bind:open
>
    {#snippet description()}
        <p>
            Removing the fetcher also irreversibly removes the values of the options you may have
            configured.
        </p>

        {#if removeFetcherError}
            <Alert
                details={removeFetcherError.errorDetails}
                title={removeFetcherError.errorTitle}
                variant="error"
            />
        {/if}
    {/snippet}
</AlertDialog>
