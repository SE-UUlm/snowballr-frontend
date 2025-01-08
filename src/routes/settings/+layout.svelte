<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";

    const { data, children } = $props();
    const { user } = data;
</script>

<SimpleNavigationBar {user} loadingTitle={Promise.resolve("Settings")} backRef="/" />

{@render children()}
