<script lang="ts">
    import SimpleNavigationBar from "$lib/components/custom/SimpleNavigationBar.svelte";

    const user = {
        firstName: "Max",
        lastName: "Mustermann",
    };
</script>

<SimpleNavigationBar {user} title="SnowballR" />
