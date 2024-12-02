<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";

    const { data } = $props();
    const { user } = data;
</script>

<svelte:head>
    <title>Project Invitations</title>
</svelte:head>
<SimpleNavigationBar {user} title="Invitations" backRef="/" tabs={[]} defaultTabValue="" />
