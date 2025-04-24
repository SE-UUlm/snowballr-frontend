<script lang="ts">
    import ChangeNameSettings from "$lib/components/composites/settings/user-settings/ChangeNameSettings.svelte";
    import UserSettingsLayout from "$lib/components/composites/settings/user-settings/UserSettingsLayout.svelte";

    const { data } = $props();
    const { user } = $derived(data);
</script>

<svelte:head>
    <title>Account | Settings</title>
</svelte:head>

<UserSettingsLayout selectedTab="account">
    <div class="flex flex-col gap-9 overflow-auto p-2.5">
        <ChangeNameSettings {user} />
    </div>
</UserSettingsLayout>
