<script lang="ts">
    import "../app.css";

    let { children } = $props();
</script>

<div class="p-4 flex flex-col items-start w-screen h-screen gap-4">
    {@render children()}
</div>
