<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import FetcherOptionsDialog from "./FetcherOptionsDialog.svelte";
    import FetcherAddDialog from "./FetcherAddDialog.svelte";
    import FetcherRemovalDialog from "./FetcherRemovalDialog.svelte";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import type { ActionError } from "$lib/model/action-error";
    import type { FetcherInformation } from "$api/fetcher";
    import type { Fetchers, SaveFetchers } from "./fetcher";

    interface Props {
        sectionTitle: string;
        locked?: boolean;
        loading: boolean;
        /** Whether the fetchers have been loaded at least once, controlling the skeleton. */
        initialized: boolean;
        disabled: boolean;
        loadFetchersError: ActionError;
        availableFetchers: FetcherInformation[];
        usedFetchers: FetcherInformation[];
        unusedFetchers: FetcherInformation[];
        fetchers: Fetchers;
        onSave: SaveFetchers;
    }

    let {
        sectionTitle,
        locked = false,
        loading,
        initialized,
        disabled,
        loadFetchersError,
        availableFetchers,
        usedFetchers,
        unusedFetchers,
        fetchers,
        onSave,
    }: Props = $props();
</script>

<!--
@component
Shared presentational list of a fetcher configuration: the currently used fetchers
(with edit/remove actions) followed by the still available, unused ones (with an add action).

Used both for a project's fetcher settings and a user's default fetcher settings, which only
differ in where the fetchers map is loaded from and how it is persisted.

Usage:
```svelte
    <FetcherSettingsList
        sectionTitle="Fetcher Settings"
        {loading}
        {initialized}
        {disabled}
        {loadFetchersError}
        {availableFetchers}
        {usedFetchers}
        {unusedFetchers}
        {fetchers}
        {onSave}
    />
```
-->
<SettingsSection {loading} {locked} {sectionTitle}>
    <ActionErrorAlert error={loadFetchersError} />
    {#if !initialized}
        <Skeleton class="h-8 w-24" />
        <Skeleton class="h-8 w-32" />
        <Skeleton class="h-8 w-48" />
        <Skeleton class="h-8 w-38" />
    {:else}
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
                        <FetcherOptionsDialog {disabled} {fetcher} {fetchers} {onSave} />
                        <FetcherRemovalDialog {disabled} {fetcher} {fetchers} {onSave} />
                    </div>
                </li>
            {/each}
        </ul>

        <ul class="flex flex-col gap-2">
            {#each unusedFetchers as fetcher (fetcher.id)}
                <li class="flex flex-row items-center justify-between">
                    <h4>{fetcher.name}</h4>
                    <FetcherAddDialog {disabled} {fetcher} {fetchers} {onSave} />
                </li>
            {/each}
        </ul>
    {/if}
</SettingsSection>
