<script lang="ts">
    let { data } = $props();
    const { loadingProject } = data;
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
