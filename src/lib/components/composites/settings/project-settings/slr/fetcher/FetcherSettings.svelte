<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Project, Project_Settings } from "$api/project";
    import { onMount } from "svelte";
    import FetcherOptionsDialog from "./FetcherOptionsDialog.svelte";
    import FetcherAddDialog from "./FetcherAddDialog.svelte";
    import FetcherRemovalDialog from "./FetcherRemovalDialog.svelte";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import type { FetcherInformation } from "$api/fetcher";

    interface Props {
        slrSettingsLocked?: boolean;
        loadingProject: Promise<Project>;
    }

    const { slrSettingsLocked, loadingProject }: Props = $props();

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    let loadAvailableFetchersError: ActionError = $state(undefined);
    let loading = $state(true);
    let projectSettings: Project_Settings | undefined = $state();
    let disabled = $derived(slrSettingsLocked || loading || isProjectArchived);

    let availableFetchers: FetcherInformation[] = $state([]);
    let usedFetchers: FetcherInformation[] = $state([]);
    let unusedFetchers = $derived(
        availableFetchers.filter((it) => usedFetchers.map((f) => f.id).indexOf(it.id) === -1),
    );

    async function loadProject(project: Project) {
        loading = true;
        projectSettings = project.settings;
        availableFetchers = await backendService
            .getAvailableFetchers({})
            .response.then((it) => it.fetchers)
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
        usedFetchers = availableFetchers.filter(
            (it) => Object.keys(projectSettings?.fetchers || {}).indexOf(it.id) !== -1,
        );
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

<SettingsSection {loading} locked={slrSettingsLocked} sectionTitle="Fetcher Settings">
    <ActionErrorAlert error={loadAvailableFetchersError} />
    {#await loadingProject}
        <Skeleton class="h-8 w-24" />
        <Skeleton class="h-8 w-32" />
        <Skeleton class="h-8 w-48" />
        <Skeleton class="h-8 w-38" />
    {:then project}
        {#if availableFetchers.length === 0}
            <span class="text-hint italic">
                This SnowballR instance has no registered fetchers yet.
            </span>
        {/if}

        <ul class="flex flex-col gap-2">
            {#each usedFetchers as fetcher (fetcher.id)}
                <li class="flex flex-row items-center justify-between">
                    <h4>{fetcher.name}</h4>
                    <div>
                        <FetcherOptionsDialog
                            {disabled}
                            {fetcher}
                            onProjectChanged={loadProject}
                            {project}
                        />
                        <FetcherRemovalDialog
                            {disabled}
                            {fetcher}
                            onProjectChanged={loadProject}
                            {project}
                        />
                    </div>
                </li>
            {/each}
        </ul>

        <ul class="flex flex-col gap-2">
            {#each unusedFetchers as fetcher (fetcher.id)}
                <li class="flex flex-row items-center justify-between">
                    <h4>{fetcher.name}</h4>
                    <FetcherAddDialog
                        {disabled}
                        {fetcher}
                        onProjectChanged={loadProject}
                        {project}
                    />
                </li>
            {/each}
        </ul>
    {/await}
</SettingsSection>
