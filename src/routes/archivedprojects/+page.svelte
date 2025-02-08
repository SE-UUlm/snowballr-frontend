<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";

    const { data } = $props();
    const { user } = data;
</script>

<svelte:head>
    <title>Archived Projects</title>
</svelte:head>
<SimpleNavigationBar {user} loadingTitle={Promise.resolve("Archived Projects")} backRef="/" />
