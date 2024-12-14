<script lang="ts">
    import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";
    import { getCurrentUser } from "$lib/current-user.js";

    const { data } = $props();
    const { project, paper, isReviewMode } = data;
    const user = getCurrentUser();
</script>

<svelte:head>
    <title>{paper.title} | {project.name}</title>
</svelte:head>
<PaperView
    {user}
    {paper}
    showButtonBar={true}
    backRef={`/project/${project.id}/dashboard`}
    userConfig={{ isReviewMode, showMaybeButton: true }}
/>
