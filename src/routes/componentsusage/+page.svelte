<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";

    const user = {
        firstName: "Max",
        lastName: "Mustermann",
    };

    const searchPlaceholderText: string = "Search paper";
</script>

<div class="flex flex-col gap-5">
    <SimpleNavigationBar {user} title="SnowballR" tabs={[]} defaultTabValue="" />

    <SearchBar placeholderText={searchPlaceholderText} onSearch={(input) => console.log(input)} />
    <SearchBar onSearch={(input) => console.log(input)} />
</div>
