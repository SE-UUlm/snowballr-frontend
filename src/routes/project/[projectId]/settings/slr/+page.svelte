<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import MaybeAsDecisionSetting from "$lib/components/composites/settings/project-settings/slr/MaybeAsDecisionSetting.svelte";
    import { MemberRole } from "$lib/model/api/project.js";
    import { resource } from "$lib/resource.svelte.js";

    let { data } = $props();
    const { user, projectId, loadingProject, loadingMemebers } = data;

    const isCurrentUserAdmin = resource<boolean, boolean>(
        loadingMemebers.then(
            (members) =>
                members.find((member) => member.user!.id === user.id)?.role === MemberRole.ADMIN,
        ),
        {
            initialValue: false,
            onErrorValue: false,
            resourceName: "isCurrentUserAdmin",
        },
    );
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
    {#if isCurrentUserAdmin.value}
        <MaybeAsDecisionSetting {projectId} {loadingProject} />
    {/if}
</ProjectSettingsLayout>
