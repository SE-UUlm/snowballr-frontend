<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";

    const user = {
        firstName: "Max",
        lastName: "Mustermann",
    };
</script>

<SimpleNavigationBar {user} title="Archived Projects" backRef="/" tabs={[]} defaultTabValue="" />
