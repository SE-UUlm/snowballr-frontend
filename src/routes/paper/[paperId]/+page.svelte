<script lang="ts">
    import PaperView from "$lib/components/composites/paper-components/PaperView.svelte";

    const { data } = $props();
    const { user, paper } = data;
</script>

<svelte:head>
    <title>{paper.title}</title>
</svelte:head>
<PaperView {user} {paper} />
