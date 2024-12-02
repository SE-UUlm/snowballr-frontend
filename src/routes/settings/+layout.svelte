<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";

    const { data, children } = $props();
</script>

<SimpleNavigationBar user={data.user} title="Settings" backRef="/" tabs={[]} defaultTabValue="" />

{@render children()}
