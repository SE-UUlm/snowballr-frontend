<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import Button from "$lib/components/primitives/button/button.svelte";
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Project, Project_Settings } from "$api/project";
    import { onMount } from "svelte";
    import FetcherOptionsDialog from "./FetcherOptionsDialog.svelte";
    import SquarePen from "@lucide/svelte/icons/square-pen";
    import Lock from "@lucide/svelte/icons/lock";
    import CirclePlus from "@lucide/svelte/icons/circle-plus";
    import Trash from "@lucide/svelte/icons/trash";
    import FetcherAddDialog from "./FetcherAddDialog.svelte";
    import FetcherRemovalDialog from "./FetcherRemovalDialog.svelte";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";

    interface Props {
        projectId: string;
        slrSettingsLocked?: boolean;
        loadingProject: Promise<Project>;
    }

    const { projectId, slrSettingsLocked, loadingProject }: Props = $props();

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    let loadAvailableFetchersError: ActionError = $state(undefined);
    let loading = $state(true);
    let projectSettings: Project_Settings | undefined = $state();

    let availableFetchers: string[] = $state([]);
    let usedFetchers: string[] = $state([]);
    let unusedFetchers = $derived(
        availableFetchers.filter((it) => usedFetchers.indexOf(it) === -1),
    );

    let optionDialogOpen = $state(false);
    let addDialogOpen = $state(false);
    let removalDialogOpen = $state(false);
    let fetcherToEdit: string = $state("");
    let fetcherToRemove: string = $state("");

    // Update the current state using the provided project
    async function loadProject(project: Project) {
        loading = true;
        projectSettings = project.settings;
        availableFetchers = await backendService
            .getAvailableFetchers({})
            .response.then((it) => it.fetcherNames)
            .catch((error) => {
                loadAvailableFetchersError = createActionError(
                    "Failed to Retrieve available Fetchers",
                    {
                        action: "retrieving the available fetchers",
                    },
                    error,
                );
                return [];
            });
        usedFetchers = Object.keys(projectSettings?.fetchers || {});
        loading = false;
    }

    onMount(async () => {
        loading = true;
        loadAvailableFetchersError = undefined;
        await loadingProject.then(loadProject).catch((error) => {
            loadAvailableFetchersError = createActionError(
                "Failed to Load the Project Settings",
                {
                    action: "loading the project settings",
                },
                error,
            );
        });
        loading = false;
    });
</script>

<FetcherOptionsDialog
    fetcher={fetcherToEdit}
    onProjectChanged={loadProject}
    {projectId}
    {projectSettings}
    {slrSettingsLocked}
    bind:open={optionDialogOpen}
/>

<FetcherAddDialog
    onProjectChanged={loadProject}
    {projectId}
    {projectSettings}
    {unusedFetchers}
    bind:open={addDialogOpen}
/>

<FetcherRemovalDialog
    fetcher={fetcherToRemove}
    onProjectChanged={loadProject}
    {projectId}
    {projectSettings}
    bind:open={removalDialogOpen}
/>

<SettingsSection {loading} sectionTitle="Fetcher Settings">
    <ActionErrorAlert error={loadAvailableFetchersError} />
    {#if !loading}
        {#if availableFetchers.length === 0}
            <span class="text-hint italic">
                This SnowballR instance has no registered fetchers yet.
            </span>
        {:else if usedFetchers.length === 0}
            <span class="text-hint italic">This project has no fetcher configured yet.</span>
        {/if}

        <ul>
            {#each usedFetchers as fetcher (fetcher)}
                <li class="flex flex-row items-center gap-4">
                    <h4>{fetcher}</h4>
                    <div class="flex-1"></div>
                    <Button
                        disabled={isProjectArchived}
                        onclick={() => {
                            fetcherToEdit = fetcher;
                            optionDialogOpen = true;
                        }}
                        variant="ghost"
                    >
                        <SquarePen />
                    </Button>
                    <Button
                        class="border-none bg-white hover:bg-red-400/10"
                        disabled={slrSettingsLocked || isProjectArchived}
                        onclick={() => {
                            fetcherToRemove = fetcher;
                            removalDialogOpen = true;
                        }}
                        variant="destructiveSubtle"
                    >
                        <Trash />
                    </Button>
                </li>
            {/each}
        </ul>
    {:else}
        <Skeleton class="h-8 w-24" />
        <Skeleton class="h-8 w-32" />
        <Skeleton class="h-8 w-48" />
        <Skeleton class="h-8 w-38" />
    {/if}

    <LoadingButton
        class="w-full sm:w-100"
        disabled={slrSettingsLocked || loading || isProjectArchived || unusedFetchers.length === 0}
        label="Add Fetcher(s)"
        onclick={() => (addDialogOpen = true)}
    >
        {#snippet icon()}
            {#if slrSettingsLocked}
                <Lock />
            {:else}
                <CirclePlus />
            {/if}
        {/snippet}
    </LoadingButton>
</SettingsSection>
