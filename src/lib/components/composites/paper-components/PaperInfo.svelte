<script lang="ts">
    interface Props {
        paper: {
            id?: number | undefined;
            title: string;
            authors: string[];
        };
    }

    const { paper }: Props = $props();
</script>

<div class="grid grid-flow-row gap-0">
    <div class="grid grid-flow-col gap-1 items-center">
        {#if paper.id}
            <div class="text-default-semibold">#{paper.id}</div>
        {/if}
        <h1 class="place-content-center truncate">{paper.title}</h1>
    </div>
    <div class="text-hint truncate">{paper.authors.join(", ")}</div>
</div>
