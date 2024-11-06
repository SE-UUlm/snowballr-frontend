<script lang="ts">
    let { children, data } = $props();
</script>

<h3>Project {data.projectId} Settings Layout</h3>

{@render children()}
