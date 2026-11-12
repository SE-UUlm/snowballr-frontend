<script lang="ts">
    import { getAvailableFetchers } from "$lib/api/fetcher";
    import { getUserSettings } from "$lib/api/user";
    import type { FetcherInformation, UserSettings } from "$lib/api/types";
    import { onMount } from "svelte";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import FetcherSettingsList from "$lib/components/composites/settings/fetcher/FetcherSettingsList.svelte";
    import type { SaveFetchers } from "$lib/components/composites/settings/fetcher/fetcher";
    import { updateDefaultFetchers } from "./update-default-fetchers";

    let loadError: ActionError = $state(undefined);
    let loading = $state(true);
    let initialized = $state(false);
    let userSettings: UserSettings | undefined = $state();

    let availableFetchers: FetcherInformation[] = $state([]);

    onMount(async () => {
        loading = true;

        loadError = undefined;
        await Promise.all([getUserSettings(), getAvailableFetchers()]).then(
            ([loadedUserSettings, loadedFetchers]) => {
                userSettings = loadedUserSettings;
                availableFetchers = loadedFetchers;
                initialized = true;
            },
            (error) => {
                loadError = createActionError(
                    "Failed to Load your Default Fetcher Settings",
                    {
                        action: "loading your default fetcher settings",
                    },
                    error,
                );
            },
        );

        loading = false;
    });

    const saveFetchers: SaveFetchers = async (fetchers, onSuccess, onError) => {
        await updateDefaultFetchers(
            fetchers,
            (updatedUserSettings) => {
                onSuccess();
                userSettings = updatedUserSettings;
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
/>
