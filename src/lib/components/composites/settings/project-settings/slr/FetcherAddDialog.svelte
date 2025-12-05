<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import * as Select from "$lib/components/primitives/select";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import { Project, Project_Settings } from "$lib/model/api/project";
    import { pluralize } from "$lib/utils/common-helper";
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

    let addFetcherError: ActionError = $state(undefined);
    let loading = $state(false);
    let fetchers: string[] = $state([]);
    const content = $derived(
        fetchers.length === 0
            ? "Select a fetcher"
            : `${fetchers.length} ${pluralize(fetchers.length, "fetcher", "fetchers")} selected`,
    );

    // Add the selected fetcher (value) to the project (projectId)
    async function addFetcher() {
        if (fetchers.length === 0) {
            addFetcherError = createActionError("No Fetcher Selected", {
                customDetails: "You need to select a fetcher first, before you can add one.",
            });
            return;
        }

        loading = true;

        const updatedFetcherApis = projectSettings?.fetchers ?? {};
        for (const fetcher of fetchers) {
            updatedFetcherApis[fetcher] = { options: {} };
        }

        await updateFetchers(
            projectId,
            updatedFetcherApis,
            (it) => {
                open = false;
                onProjectChanged(it);
            },
            (it) => (addFetcherError = it),
        );

        loading = false;
    }

    // Reset error and selected fetchers when `open` value changes
    $effect(() => {
        if (open || !open) {
            addFetcherError = undefined;
            fetchers = [];
        }
    });
</script>

<AlertDialog
    actionButtonLoadingText={pluralize(fetchers, "Adding Fetcher", "Adding Fetchers")}
    actionButtonText={pluralize(fetchers, "Add Fetcher", "Add Fetchers")}
    actionProps={{ onclick: addFetcher, disabled: fetchers.length === 0, class: "w-38" }}
    cancelButtonText="Cancel"
    cancelProps={{ disabled: loading }}
    title="Add a Fetcher"
    bind:loading
    bind:open
>
    {#snippet description()}
        <Select.Root type="multiple" bind:value={fetchers}>
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
        <ActionErrorAlert error={addFetcherError} />
    {/snippet}
</AlertDialog>
