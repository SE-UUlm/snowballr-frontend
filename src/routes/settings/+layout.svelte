<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";

    const { data, children } = $props();
    const { user } = $derived(data);
</script>

<SimpleNavigationBar backRef="/" loadingTitle={Promise.resolve("Settings")} {user} />

{@render children()}
