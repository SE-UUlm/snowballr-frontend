<script lang="ts">
    import type { Paper } from "$api/paper";
    import Button from "$lib/components/primitives/button/button.svelte";
    import CirclePlus from "@lucide/svelte/icons/circle-plus";
    import Trash from "@lucide/svelte/icons/trash";

    interface Props {
        paper: Paper;
        action: "add" | "remove";
        testId: string;
        buttonTestId: string;
        onClick: () => void;
    }

    const { paper, action, testId, buttonTestId, onClick }: Props = $props();

    const authorString = $derived(
        paper.authors.map((it) => `${it.firstName} ${it.lastName}`).join(", "),
    );
</script>

<!--
@component
List entry for a project paper candidate.

Usage:
```svelte
    <ProjectPaperCandidate
        action="add"
        buttonTestId="foo"
        onClick={() => console.log("foo")}
        {paper}
        testId="bar"
    />
```
-->
<div
    class="border-muted hover:bg-muted/50 flex flex-row items-center gap-2 rounded-md border p-2"
    data-testid={testId}
>
    <div class="flex-1">
        <div class="text-sm font-semibold">{paper.title}</div>
        <div class="text-muted-foreground text-xs">
            {authorString === "" ? "Unknown Authors" : authorString}
        </div>
        <div class="text-muted-foreground text-xs">
            {paper.year}{paper.publicationName ? ` - ${paper.publicationName}` : ""}
        </div>
    </div>
    <Button data-testid={buttonTestId} onclick={onClick} size="icon" variant="outline">
        {#if action === "add"}
            <CirclePlus />
        {:else if action === "remove"}
            <Trash class="text-red-400" />
        {/if}
    </Button>
</div>
