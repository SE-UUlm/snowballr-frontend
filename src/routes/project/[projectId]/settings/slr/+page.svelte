<script lang="ts">
    import { goto } from "$app/navigation";
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import MaybeAsDecisionSetting from "$lib/components/composites/settings/project-settings/slr/MaybeAsDecisionSetting.svelte";
    import FetcherSettings from "$lib/components/composites/settings/project-settings/slr/FetcherSettings.svelte";
    import { ProjectStatus } from "$lib/model/api/project.js";
    import { resource } from "$lib/resource.svelte";
    import { isCurrentUserProjectAdmin } from "../helper";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import { createActionWarning } from "$lib/model/action-error.js";

    let { data } = $props();
    const { projectId, loadingProject, loadingMembers } = $derived(data);

    const isCurrentUserAdmin = $derived(isCurrentUserProjectAdmin(loadingMembers));

    const loadingIsProjectNotActive = $derived(
        loadingProject.then((project) => project.status !== ProjectStatus.ACTIVE),
    );
    const slrSettingsLocked = $derived(
        resource(loadingIsProjectNotActive, {
            initialValue: true,
            onErrorValue: false,
            resourceName: "project status",
        }),
    );

    // Redirect to general settings if the user is not an admin
    $effect(() => {
        if (isCurrentUserAdmin.value !== undefined && !isCurrentUserAdmin.value) {
            goto(`/project/${projectId}/settings/general`, { replaceState: true });
        }
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

<ProjectSettingsLayout
    isCurrentUserAdmin={isCurrentUserAdmin.value ?? false}
    {projectId}
    selectedTab="slr"
>
    <ActionErrorAlert
        error={slrSettingsLocked.value
            ? createActionWarning("SLR Settings are Locked", {
                  customDetails:
                      "To ensure consistency, SLR settings can't be changed after a review has been submitted.",
              })
            : undefined}
    />
    <MaybeAsDecisionSetting {projectId} slrSettingsLocked={slrSettingsLocked.value} />
    <FetcherSettings {projectId} slrSettingsLocked={slrSettingsLocked.value} />
</ProjectSettingsLayout>
