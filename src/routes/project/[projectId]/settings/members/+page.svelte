<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/ProjectSettingsLayout.svelte";

    let { data } = $props();
    const { projectId, loadingProject } = data;
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>Members | Settings | {project.name}</title>
    {:catch}
        <title>Members | Settings</title>
    {/await}
</svelte:head>

<ProjectSettingsLayout {projectId} selectedTab="members">Members content</ProjectSettingsLayout>
