<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import Alert from "$lib/components/composites/utils/Alert.svelte";
    import * as Select from "$lib/components/primitives/select";
    import { Project, Project_Settings } from "$lib/model/api/project";
    import type { ApiError } from "$lib/model/general";
    import { updateFetchers } from "./UpdateFetchers";

    interface Props {
        projectId: string;
        projectSettings: Project_Settings | undefined;
        unusedFetchers: string[];
        onProjectChanged: (project: Project) => void;
        open: boolean;
    }

    let {
        projectId,
        projectSettings,
        onProjectChanged,
        unusedFetchers,
        open = $bindable(),
    }: Props = $props();

    let error: ApiError | undefined = $state();
    let fetcher: string | undefined = $state();
    const content = $derived(unusedFetchers.find((f) => f === fetcher) ?? "Select a fetcher");

    // Add the selected fetcher (value) to the project (projectId)
    async function addFetcher() {
        if (!fetcher) {
            error = {
                errorTitle: "No Fetcher Selected",
                errorDetails: "You need to select a fetcher first, before you can add one.",
            };
            return;
        }

        const updatedFetcherApis = projectSettings?.fetchers ?? {};
        updatedFetcherApis[fetcher] = { options: {} };
        await updateFetchers(
            projectId,
            updatedFetcherApis,
            (it) => {
                open = false;
                onProjectChanged(it);
            },
            (it) => (error = it),
        );
    }
</script>

<AlertDialog
    actionButtonText="Add"
    actionProps={{ onclick: addFetcher }}
    cancelButtonText="Cancel"
    title="Add a Fetcher"
    bind:open
>
    {#snippet description()}
        <Select.Root type="single" bind:value={fetcher}>
            <Select.Trigger class="w-full">
                {content}
            </Select.Trigger>
            <Select.Content>
                {#each unusedFetchers as fetcher (fetcher)}
                    <Select.Item label={fetcher} value={fetcher}>
                        {fetcher}
                    </Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        {#if error}
            <Alert details={error.errorDetails} title={error.errorTitle} variant="error" />
        {/if}
    {/snippet}
</AlertDialog>
