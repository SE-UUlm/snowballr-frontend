<script lang="ts">
    import { backendService } from "$lib/grpc-api";
    import { UserSettings } from "$api/user_settings";
    import { onMount } from "svelte";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import type { FetcherInformation } from "$api/fetcher";
    import FetcherSettingsList from "$lib/components/composites/settings/fetcher/FetcherSettingsList.svelte";
    import type { SaveFetchers } from "$lib/components/composites/settings/fetcher/fetcher";
    import { updateDefaultFetchers } from "./update-default-fetchers";

    let loadError: ActionError = $state(undefined);
    let loading = $state(true);
    let initialized = $state(false);
    let userSettings: UserSettings | undefined = $state();

    let availableFetchers: FetcherInformation[] = $state([]);
    let usedFetchers: FetcherInformation[] = $state([]);
    let unusedFetchers = $derived(
        availableFetchers.filter((it) => usedFetchers.map((f) => f.id).indexOf(it.id) === -1),
    );

    async function loadDefaultFetcherSettings(loadedUserSettings: UserSettings) {
        loading = true;
        userSettings = loadedUserSettings;
        availableFetchers = await backendService
            .getAvailableFetchers({})
            .response.then((it) => it.fetchers)
            .catch((error) => {
                loadError = createActionError(
                    "Failed to Retrieve available Fetchers",
                    {
                        action: "retrieving the available fetchers",
                    },
                    error,
                );
                return [];
            });
        usedFetchers = availableFetchers.filter(
            (it) =>
                Object.keys(userSettings?.defaultProjectSettings?.fetchers || {}).indexOf(it.id) !==
                -1,
        );
        loading = false;
        initialized = true;
    }

    onMount(async () => {
        loading = true;

        loadError = undefined;
        await backendService
            .getUserSettings({})
            .response.then(loadDefaultFetcherSettings)
            .catch((error) => {
                loadError = createActionError(
                    "Failed to Load your Default Fetcher Settings",
                    {
                        action: "loading your default fetcher settings",
                    },
                    error,
                );
            });

        loading = false;
    });

    const saveFetchers: SaveFetchers = async (fetchers, onSuccess, onError) => {
        await updateDefaultFetchers(
            fetchers,
            (updatedUserSettings) => {
                onSuccess();
                loadDefaultFetcherSettings(updatedUserSettings);
            },
            onError,
        );
    };
</script>

<!--
@component
Lets the user choose which fetcher sources are used by default whenever they create a new project.

Usage:
```svelte
    <DefaultFetcherSettings />
```
-->
<FetcherSettingsList
    {availableFetchers}
    disabled={loading}
    fetchers={userSettings?.defaultProjectSettings?.fetchers ?? {}}
    {initialized}
    loadFetchersError={loadError}
    {loading}
    onSave={saveFetchers}
    sectionTitle="Default Fetcher Settings"
    {unusedFetchers}
    {usedFetchers}
/>
