<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import Button from "$lib/components/primitives/button/button.svelte";
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Project, Project_Settings } from "$lib/model/api/project";
    import { onMount } from "svelte";
    import FetcherOptionsDialog from "./FetcherOptionsDialog.svelte";
    import { Edit, Lock, PlusCircle, Trash } from "lucide-svelte";
    import Alert from "$lib/components/composites/utils/Alert.svelte";
    import FetcherAddDialog from "./FetcherAddDialog.svelte";
    import FetcherRemovalDialog from "./FetcherRemovalDialog.svelte";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { createActionError, type ActionError } from "$lib/model/action-error";

    interface Props {
        projectId: string;
        slrSettingsLocked?: boolean;
    }

    const { projectId, slrSettingsLocked = false }: Props = $props();

    let loadAvailableFetchersError: ActionError = $state(undefined);
    let loading = $state(true);
    let projectSettings: Project_Settings | undefined = $state();

    let availableFetchers: string[] | undefined = $state();
    let usedFetchers: string[] | undefined = $state();
    let unusedFetchers = $derived(
        availableFetchers?.filter((it) => usedFetchers?.find((x) => x == it) === undefined),
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

    // Fetch project (projectId) from backend and update current state with it
    async function refetchProject() {
        loading = true;
        loadAvailableFetchersError = undefined;
        await backendService
            .getProjectById({ id: projectId })
            .response.then(loadProject)
            .catch((error) => {
                loadAvailableFetchersError = createActionError(
                    "Failed to Load the Project Settings",
                    {
                        action: "loading the project settings",
                    },
                    error,
                );
            });
    }

    // Instantly load project from backend when this component loads
    onMount(async () => {
        await refetchProject();
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
    unusedFetchers={unusedFetchers ?? []}
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
    {#if loadAvailableFetchersError}
        <Alert
            details={loadAvailableFetchersError.errorDetails}
            title={loadAvailableFetchersError.errorTitle}
            variant="error"
        />
    {/if}
    {#if !loading && usedFetchers}
        {#if usedFetchers.length === 0}
            <p>This project has no fetcher configured yet.</p>
        {/if}

        {#each usedFetchers as fetcher (fetcher)}
            <div class="flex flex-row items-center gap-4">
                <h4>{fetcher}</h4>
                <div class="flex-1"></div>
                <Button
                    onclick={() => {
                        fetcherToEdit = fetcher;
                        optionDialogOpen = true;
                    }}
                    variant="ghost"
                >
                    <Edit />
                </Button>
                <Button
                    class="text-red-400 hover:bg-red-400/10 hover:text-red-400"
                    disabled={slrSettingsLocked}
                    onclick={() => {
                        fetcherToRemove = fetcher;
                        removalDialogOpen = true;
                    }}
                    variant="ghost"
                >
                    <Trash />
                </Button>
            </div>
        {/each}
    {:else}
        <Skeleton class="h-8 w-24" />
        <Skeleton class="h-8 w-32" />
        <Skeleton class="h-8 w-48" />
        <Skeleton class="h-8 w-38" />
    {/if}

    {#if unusedFetchers?.length !== 0}
        <LoadingButton
            disabled={slrSettingsLocked || loading}
            label="Add Fetcher(s)"
            onclick={() => (addDialogOpen = true)}
        >
            {#snippet icon()}
                {#if slrSettingsLocked}
                    <Lock />
                {:else}
                    <PlusCircle />
                {/if}
            {/snippet}
        </LoadingButton>
    {/if}
</SettingsSection>
