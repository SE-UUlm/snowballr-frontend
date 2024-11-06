<script lang="ts">
    let { children, data } = $props();
</script>

<h2>Project {data.projectId} Layout</h2>

{@render children()}
