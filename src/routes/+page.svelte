<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";

    const { data } = $props();
    const { user } = data;
</script>

<svelte:head>
    <title>SnowballR</title>
</svelte:head>
<div class="flex flex-col gap-3">
    <SimpleNavigationBar {user} title="SnowballR" tabs={[]} defaultTabValue="" />
</div>
