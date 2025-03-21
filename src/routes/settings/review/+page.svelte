<script lang="ts">
    import ReviewModeSettings from "$lib/components/composites/settings/user-settings/ReviewModeSettings.svelte";
    import UserSettingsLayout from "$lib/components/composites/settings/user-settings/UserSettingsLayout.svelte";
</script>

<svelte:head>
    <title>Review | Settings</title>
</svelte:head>

<UserSettingsLayout selectedTab="review">
    <div class="flex flex-col gap-9 overflow-auto p-2.5">
        <ReviewModeSettings />
    </div>
</UserSettingsLayout>
