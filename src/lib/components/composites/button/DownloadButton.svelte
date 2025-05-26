<script lang="ts">
    import Tooltip from "$lib/components/composites/utils/Tooltip.svelte";
    import { resource } from "$lib/resource.svelte";
    import { Download } from "lucide-svelte";

    interface Props {
        loadingPaperId: Promise<string>;
    }

    const { loadingPaperId }: Props = $props();

    const tooltipText = "Download this paper";
    const paperId = resource<string, string | undefined>(loadingPaperId, {
        initialValue: undefined,
        resourceName: "paper ID",
    });

    function downloadPaper() {
        // TODO: Will be implemented in #290
        console.log(`Download paper with id ${paperId.value}.`);
        dispatchEvent(new CustomEvent("downloadPaper"));
    }
</script>

<!--
@component
Button to download a paper.

Usage:
```svelte
<DownloadButton loadingPaperId={42} />
```
-->
<Tooltip
    class="border-container-border-grey text-primary h-fit w-fit border bg-transparent p-1.5 hover:bg-transparent"
    aria-label={tooltipText}
    onclick={() => downloadPaper()}
>
    {#snippet trigger()}
        <Download />
    {/snippet}
    {#snippet content()}
        <p>{tooltipText}</p>
    {/snippet}
</Tooltip>
