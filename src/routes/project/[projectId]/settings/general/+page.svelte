<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import ProjectNameSettings from "$lib/components/composites/settings/project-settings/general/ProjectNameSettings.svelte";
    import { MemberRole } from "$lib/model/api/project.js";
    import { resource } from "$lib/resource.svelte.js";

    let { data } = $props();
    const { user, projectId, loadingProject, loadingMembers } = $derived(data);

    const isCurrentUserAdmin = $derived(
        resource<boolean, boolean>(
            loadingMembers.then(
                (members) =>
                    members.find((member) => member.user!.id === user.id)?.role ===
                    MemberRole.ADMIN,
            ),
            {
                initialValue: false,
                onErrorValue: false,
                resourceName: "isCurrentUserAdmin",
            },
        ),
    );
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>General | Settings | {project.name}</title>
    {:catch}
        <title>General | Settings</title>
    {/await}
</svelte:head>

<ProjectSettingsLayout
    isCurrentUserAdmin={isCurrentUserAdmin.value}
    {projectId}
    selectedTab="general"
>
    <div class="flex flex-col gap-9 overflow-auto p-2.5">
        <ProjectNameSettings {loadingProject} {projectId} />
    </div>
</ProjectSettingsLayout>
