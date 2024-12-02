<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
    import PaperEntry from "$lib/components/composites/paper-components/PaperEntry.svelte";

    const { data } = $props();
    const { user, paper, paper2 } = data;

    const searchPlaceholderText: string = "Search paper";
</script>

<svelte:head>
    <title>Component Usage Demo</title>
</svelte:head>
<div class="flex flex-col gap-5">
    <SimpleNavigationBar {user} title="SnowballR" tabs={[]} defaultTabValue="" />

    <SearchBar placeholderText={searchPlaceholderText} onSearch={(input) => console.log(input)} />
    <SearchBar onSearch={(input) => console.log(input)} />

    <PaperEntry {paper} projectId={42} showReviewStatus={true} />
    <PaperEntry
        paper={paper2}
        projectId={42}
        showReviewStatus={true}
        onClick={() =>
            console.log(
                "Here you can add your code to open and close a paper information overlay...",
            )}
    />
</div>
