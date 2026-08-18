<script lang="ts">
    import { backendService } from "$lib/grpc-api";
    import { Project, Project_Settings } from "$api/project";
    import { onMount } from "svelte";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import type { FetcherInformation } from "$api/fetcher";
    import FetcherSettingsList from "$lib/components/composites/settings/fetcher/FetcherSettingsList.svelte";
    import type { SaveFetchers } from "$lib/components/composites/settings/fetcher/fetcher";
    import { updateFetchers } from "./update-fetchers";

    interface Props {
        slrSettingsLocked?: boolean;
        loadingProject: Promise<Project>;
    }

    const { slrSettingsLocked, loadingProject }: Props = $props();

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    let loadAvailableFetchersError: ActionError = $state(undefined);
    let loading = $state(true);
    let initialized = $state(false);
    let projectId: string | undefined = $state();
    let projectSettings: Project_Settings | undefined = $state();
    let disabled = $derived(slrSettingsLocked || loading || isProjectArchived);

    let availableFetchers: FetcherInformation[] = $state([]);
    let usedFetchers: FetcherInformation[] = $state([]);
    let unusedFetchers = $derived(
        availableFetchers.filter((it) => usedFetchers.map((f) => f.id).indexOf(it.id) === -1),
    );

    async function loadProject(project: Project) {
        loading = true;
        projectId = project.id;
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
        initialized = true;
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

    const saveFetchers: SaveFetchers = async (fetchers, onSuccess, onError) => {
        if (projectId === undefined) return;

        await updateFetchers(
            projectId,
            fetchers,
            (updatedProject) => {
                onSuccess();
                loadProject(updatedProject);
            },
            onError,
        );
    };
</script>

<FetcherSettingsList
    {availableFetchers}
    {disabled}
    fetchers={projectSettings?.fetchers ?? {}}
    {initialized}
    loadFetchersError={loadAvailableFetchersError}
    {loading}
    locked={slrSettingsLocked}
    onSave={saveFetchers}
    sectionTitle="Fetcher Settings"
    {unusedFetchers}
    {usedFetchers}
/>
