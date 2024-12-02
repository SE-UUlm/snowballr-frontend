<script lang="ts">
    let { data } = $props();
    const { project } = data;
</script>

<svelte:head>
    <title>Review | Settings | {project.name}</title>
</svelte:head>
<h4>Project {project.id} Settings - Review</h4>
