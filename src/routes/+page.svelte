<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";

    const user = {
        firstName: "Max",
        lastName: "Mustermann",
    };

    const searchPlaceholderText: string = "Search paper";
</script>

<SimpleNavigationBar {user} title="SnowballR" tabs={[]} defaultTabValue="" />

<SearchBar placeholderText={searchPlaceholderText}></SearchBar>
