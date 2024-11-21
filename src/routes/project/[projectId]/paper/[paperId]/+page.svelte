<script lang="ts">
    import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";

    const { data } = $props();
    const { user, project, paper, isReviewMode } = data;
</script>

<svelte:head>
    <title>{paper.title} | {project.name}</title>
</svelte:head>
<PaperView
    {user}
    {paper}
    showNavigationButtons={true}
    backRef={`/project/${project.id}/dashboard`}
    userConfig={{ isReviewMode, showMaybeButton: true }}
/>
