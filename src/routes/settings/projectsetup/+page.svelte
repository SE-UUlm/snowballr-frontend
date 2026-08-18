<script lang="ts">
    import UserSettingsLayout from "$lib/components/composites/settings/user-settings/UserSettingsLayout.svelte";
    import DefaultFetcherSettings from "$lib/components/composites/settings/user-settings/fetcher/DefaultFetcherSettings.svelte";
</script>

<svelte:head>
    <title>Project Setup | Settings</title>
</svelte:head>

<UserSettingsLayout selectedTab="projectsetup">
    <div class="flex flex-col gap-9 overflow-auto p-2.5">
        <DefaultFetcherSettings />
    </div>
</UserSettingsLayout>
