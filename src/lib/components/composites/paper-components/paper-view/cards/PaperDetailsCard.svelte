<script lang="ts">
    import PaperCard from "./PaperCard.svelte";
    import PaperCardContent from "./PaperCardContent.svelte";
    import { Paper } from "$lib/model/api/paper";
    import PaperDetailsCardContent from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCardContent.svelte";
    import Pencil from "lucide-svelte/icons/pencil";
    import Save from "lucide-svelte/icons/save";
    import { cn } from "$lib/utils/shadcn-helper";
    import { backendService } from "$lib/grpc-api";
    import { generateFieldMask } from "protobuf-fieldmask";
    import { toast } from "svelte-sonner";

    interface Props {
        loadingPaper: Promise<Paper>;
        allowEditModeToggle: boolean;
        startInEditMode: boolean;
    }

    let { loadingPaper, allowEditModeToggle, startInEditMode }: Props = $props();

    let paper: Paper = $state(Paper.create());

    let originalPaper: Paper | undefined = $state(undefined);
    let isInEditMode = $state(startInEditMode);
    let isPaperModified = $state(false);

    loadingPaper.then((p) => {
        originalPaper = p;
        paper = p;
    });

    $effect(() => {
        if (paper === undefined || originalPaper === undefined) {
            return;
        }

        isPaperModified = !isEqual(originalPaper, paper);
    });

    const tabs = [
        { value: "1", label: "Information" },
        { value: "2", label: "Document" },
    ];

    async function updatePaper() {
        backendService
            .updatePaper({
                paper,
                mask: {
                    paths: generateFieldMask(paper),
                },
            })
            .response.then(() => {
                originalPaper = paper;
                isPaperModified = false;
                toast.success("Successfully updated the paper.");
            })
            .catch(() => {
                toast.error("Failed to update the paper.");
            });
    }

    function isEqual(obj1: unknown, obj2: unknown): boolean {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }
</script>

<!--
@component
`PaperCard` for displaying the details of a paper in the `PaperView` component.

Usage:
```svelte
    <PaperDetailsCard {paper} {allowEditModeToggle} {startInEditMode} />
```
-->
<PaperCard data-testid="paper-details-card" {tabs}>
    <PaperCardContent value="1">
        <PaperDetailsCardContent {isInEditMode} {loadingPaper} bind:paper />
    </PaperCardContent>
    <PaperCardContent value="2">
        <span>
            Will be implemented in
            <a class="text-blue-400" href="https://github.com/SE-UUlm/snowballr-frontend/issues/98">
                #98
            </a>
            .
        </span>
    </PaperCardContent>
    {#snippet tabListButtonList()}
        {#if allowEditModeToggle}
            <div class="flex flex-row gap-4 pr-2.5">
                {#if isInEditMode}
                    <Save
                        class={cn(
                            "select-none hover:cursor-pointer",
                            isPaperModified ? "" : "opacity-30",
                        )}
                        onclick={updatePaper}
                        size={24}
                    />
                {/if}
                <Pencil
                    class="select-none hover:cursor-pointer"
                    onclick={() => (isInEditMode = !isInEditMode)}
                    size={24}
                />
            </div>
        {/if}
    {/snippet}
</PaperCard>
