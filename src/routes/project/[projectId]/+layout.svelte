<script lang="ts">
    const { children, data } = $props();
</script>

<h2>Project {data.project.id} Layout</h2>

{@render children()}
