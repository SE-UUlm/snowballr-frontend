<script lang="ts">
    let { data } = $props();
    const { loadingProject } = data;
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>Review | Settings | {project.name}</title>
    {:catch}
        <title>Review | Settings</title>
    {/await}
</svelte:head>
