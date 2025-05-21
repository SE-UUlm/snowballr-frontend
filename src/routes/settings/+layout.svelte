<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";

    const { children } = $props();
</script>

<SimpleNavigationBar backRef="/" loadingTitle={Promise.resolve("Settings")} />

{@render children()}
