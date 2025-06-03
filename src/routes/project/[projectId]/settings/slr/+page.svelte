<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import MaybeAsDecisionSetting from "$lib/components/composites/settings/project-settings/slr/MaybeAsDecisionSetting.svelte";
    import Alert from "$lib/components/composites/utils/Alert.svelte";
    import { MemberRole, ProjectStatus } from "$lib/model/api/project.js";
    import { resource } from "$lib/resource.svelte.js";
    import { onMount } from "svelte";

    let { data } = $props();
    const { user, projectId, loadingProject, loadingMembers } = data;
    let slrSettingsLocked = $state(true);

    const isCurrentUserAdmin = resource<boolean, boolean>(
        loadingMembers.then(
            (members) =>
                members.find((member) => member.user!.id === user.id)?.role === MemberRole.ADMIN,
        ),
        {
            initialValue: false,
            onErrorValue: false,
            resourceName: "isCurrentUserAdmin",
        },
    );

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

<ProjectSettingsLayout {projectId} selectedTab="slr">
    {#if slrSettingsLocked}
        <Alert
            details="To ensure consistency, SLR settings can’t be changed after a review has been submitted."
            title="SLR Settings are Locked"
            variant="warning"
        />
    {/if}
    {#if isCurrentUserAdmin.value}
        <MaybeAsDecisionSetting {loadingProject} {projectId} {slrSettingsLocked} />
    {/if}
</ProjectSettingsLayout>
