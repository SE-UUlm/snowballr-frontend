<script>
    import ShortcutsVisibilitySettings from "$lib/components/composites/settings/user-settings/ShortcutsVisibilitySettings.svelte";
    import UserSettingsLayout from "$lib/components/composites/settings/user-settings/UserSettingsLayout.svelte";
</script>

<svelte:head>
    <title>Shortcuts | Settings</title>
</svelte:head>

<UserSettingsLayout selectedTab="shortcuts">
    <div class="flex flex-col gap-9 overflow-auto p-2.5">
        <ShortcutsVisibilitySettings />
    </div>
</UserSettingsLayout>
