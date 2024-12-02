<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";

    const { data } = $props();
    const { user } = data;
</script>

<svelte:head>
    <title>Reading List</title>
</svelte:head>
<SimpleNavigationBar {user} title="Reading List" backRef="/" tabs={[]} defaultTabValue="" />
