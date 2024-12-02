<script lang="ts">
    let { data } = $props();
    const { project } = data;
</script>

<svelte:head>
    <title>General | Settings | {project.name}</title>
</svelte:head>
<h4>Project {project.id} Settings - General</h4>
