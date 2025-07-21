<script lang="ts">
    import { goto } from "$app/navigation";
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import MaybeAsDecisionSetting from "$lib/components/composites/settings/project-settings/slr/MaybeAsDecisionSetting.svelte";
    import FetcherSettings from "$lib/components/composites/settings/project-settings/slr/FetcherSettings.svelte";
    import Alert from "$lib/components/composites/utils/Alert.svelte";
    import { ProjectStatus } from "$lib/model/api/project.js";
    import { getContext, onMount } from "svelte";
    import { isCurrentUserProjectAdmin } from "../helper.js";
    import { UserContextKey, type UserContext } from "$lib/current-user/userContext.js";

    let { data } = $props();
    const { projectId, loadingProject, loadingMembers } = $derived(data);
    const user = $derived(getContext<UserContext>(UserContextKey)());
    let slrSettingsLocked = $state(true);

    const isCurrentUserAdmin = $derived(isCurrentUserProjectAdmin(loadingMembers, user));

    $effect(() => {
        // Redirect to general settings if the user is not an admin
        if (isCurrentUserAdmin.value !== undefined && !isCurrentUserAdmin.value) {
            console.log(isCurrentUserAdmin.value);
            goto(`/project/${projectId}/settings/general`, { replaceState: true });
        }
    });

    onMount(() => {
        async function checkIfSLRSettingsAreLocked() {
            return await loadingProject
                .then((project) => {
                    return project.status !== ProjectStatus.ACTIVE;
                })
                .catch(() => {
                    return true; // If loading fails, assume settings are not locked
                });
        }

        checkIfSLRSettingsAreLocked().then((locked) => {
            slrSettingsLocked = locked;
        });
    });
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>SLR | Settings | {project.name}</title>
    {:catch}
        <title>SLR | Settings</title>
    {/await}
</svelte:head>

{#if isCurrentUserAdmin.value}
    <ProjectSettingsLayout isCurrentUserAdmin={true} {projectId} selectedTab="slr">
        {#if slrSettingsLocked}
            <Alert
                details="To ensure consistency, SLR settings can’t be changed after a review has been submitted."
                title="SLR Settings are Locked"
                variant="warning"
            />
        {/if}
        <MaybeAsDecisionSetting {loadingProject} {projectId} {slrSettingsLocked} />
        <FetcherSettings {projectId} />
    </ProjectSettingsLayout>
{/if}
