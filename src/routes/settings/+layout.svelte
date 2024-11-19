<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";

    const { children } = $props();

    const user = {
        firstName: "Max",
        lastName: "Mustermann",
    };
</script>

<SimpleNavigationBar {user} title="Settings" backRef="/" tabs={[]} defaultTabValue="" />

{@render children()}
