<script lang="ts">
    const { children, data } = $props();
    const { project } = data;
</script>

<h2>Project {project.id} Layout</h2>

{@render children()}
