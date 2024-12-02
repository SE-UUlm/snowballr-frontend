<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";

    const { data } = $props();
    const { user } = data;
</script>

<SimpleNavigationBar {user} title="Archived Projects" backRef="/" tabs={[]} defaultTabValue="" />
