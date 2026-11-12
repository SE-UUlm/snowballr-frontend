<script lang="ts">
    import { getAvailableFetchers } from "$lib/api/fetcher";
    import { Project, Project_Settings, type FetcherInformation } from "$lib/api/types";
    import { onMount } from "svelte";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import FetcherSettingsList from "$lib/components/composites/settings/fetcher/FetcherSettingsList.svelte";
    import type { SaveFetchers } from "$lib/components/composites/settings/fetcher/fetcher";
    import { updateFetchers } from "./update-fetchers";

    interface Props {
        slrSettingsLocked?: boolean;
        loadingProject: Promise<Project>;
    }

    const { slrSettingsLocked, loadingProject }: Props = $props();

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    let loadError: ActionError = $state(undefined);
    let loading = $state(true);
    let initialized = $state(false);
    let projectId: string | undefined = $state();
    let projectSettings: Project_Settings | undefined = $state();
    let disabled = $derived(slrSettingsLocked || loading || isProjectArchived);

    let availableFetchers: FetcherInformation[] = $state([]);
    let usedFetchers = $derived(
        availableFetchers.filter(
            (it) => Object.keys(projectSettings?.fetchers || {}).indexOf(it.id) !== -1,
        ),
    );
    let unusedFetchers = $derived(
        availableFetchers.filter((it) => usedFetchers.map((f) => f.id).indexOf(it.id) === -1),
    );

    onMount(async () => {
        loading = true;

        loadError = undefined;
        await Promise.all([loadingProject, getAvailableFetchers()]).then(
            ([project, loadedFetchers]) => {
                projectId = project.id;
                projectSettings = project.settings;
                availableFetchers = loadedFetchers;
                initialized = true;
            },
            (error) => {
                loadError = createActionError(
                    "Failed to Load the Project Settings",
                    {
                        action: "loading the project settings",
                    },
                    error,
                );
            },
        );

        loading = false;
    });

    const saveFetchers: SaveFetchers = async (fetchers, onSuccess, onError) => {
        if (projectId === undefined) return;

        await updateFetchers(
            projectId,
            fetchers,
            (updatedProject) => {
                onSuccess();
                projectSettings = updatedProject.settings;
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
    loadFetchersError={loadError}
    {loading}
    locked={slrSettingsLocked}
    onSave={saveFetchers}
    sectionTitle="Fetcher Settings"
    {unusedFetchers}
    {usedFetchers}
/>
