<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";

    const { data } = $props();
    const { user, paper } = data;
</script>

<svelte:head>
    <title>{paper.title}</title>
</svelte:head>
<div class="flex flex-row justify-between bg-red-200 h-fit w-full gap-4">
    <PaperNavigationBar {user} backRef="/" paper={data.paper} />
    <div class="bg-amber-400">
        <div class="w-8 h-8 bg-slate-400">BB</div>
    </div>
</div>
<main class="flex flex-col h-full w-full px-2 py-4 gap-5">
    <div class="flex flex-row w-full h-full gap-5">
        <div class="bg-red-500 w-full">Card 1</div>
        <div class="bg-green-500 w-full">Card 2</div>
    </div>
    <div class="flex flex-row w-full h-fit justify-between">
        <div>Button to left</div>
        <div>Button to right</div>
    </div>
</main>
