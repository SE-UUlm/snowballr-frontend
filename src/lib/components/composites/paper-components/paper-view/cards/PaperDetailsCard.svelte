<script lang="ts">
    import PaperCard from "./PaperCard.svelte";
    import PaperCardContent from "./PaperCardContent.svelte";
    import { Author, Paper } from "$lib/model/api/paper";
    import PaperDetailsCardContent from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCardContent.svelte";
    import Pencil from "lucide-svelte/icons/pencil";
    import Save from "lucide-svelte/icons/save";
    import { cn } from "$lib/utils/shadcn-helper";
    import { backendService } from "$lib/grpc-api";
    import { toast } from "svelte-sonner";
    import type { StringifiedPaper } from "$lib/model/general";
    import { stringifyPaper } from "$lib/utils/model-helper";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    import { isStringEqual } from "$lib/utils/common-helper";
    import { beforeNavigate } from "$app/navigation";
    import { buildFieldMask } from "$lib/utils/fieldmask-helper";

    interface Props {
        loadingPaper: Promise<Paper>;
        allowEditModeToggle: boolean;
        startInEditMode: boolean;
    }

    let { loadingPaper, allowEditModeToggle, startInEditMode }: Props = $props();

    let paper: StringifiedPaper = $state(stringifyPaper(Paper.create()));

    let originalPaper: StringifiedPaper | undefined = $state(undefined);
    let isInEditMode = $state(startInEditMode);
    let isPaperModified = $state(false);
    let isMakingApiCall = $state(false);

    $effect(() => {
        const currentPaperPromise = loadingPaper;
        if (!currentPaperPromise) return;

        currentPaperPromise
            .then((resolvedPaper) => {
                // Skip if a new promise has been assigned while waiting
                if (currentPaperPromise !== loadingPaper) return;

                originalPaper = stringifyPaper(resolvedPaper);
                paper = stringifyPaper(resolvedPaper);
            })
            .catch(() => {});
    });

    $effect(() => {
        if (paper.id === "" || originalPaper === undefined) {
            return;
        }

        isPaperModified = !isStringEqual(originalPaper, paper);
    });

    const tabs = [
        { value: "1", label: "Information" },
        { value: "2", label: "Document" },
    ];

    function stringToAuthors(value: string): Author[] {
        const authorStrings = value.split(/,\s*/g).filter((v) => v.length !== 0);
        const authors: Author[] = authorStrings.map((authorString) => {
            const parts = authorString.split(/\s+/g);
            const person: Author = {
                // Everything is the first name except the last part
                // TODO: this assumption is very error prone and we should use structured HTML to fix this
                firstName: parts.slice(0, parts.length - 1).join(" "),
                lastName: parts[parts.length - 1],
                orcid: "",
            };
            return person;
        });

        return authors;
    }

    async function updatePaper() {
        const year = Number(paper.year);
        if (!Number.isInteger(year)) {
            toast.error("The year has a non-numerical value.");
            return;
        }

        isMakingApiCall = true;

        // Convert stringifiedPaper back to Paper, ensuring correct types
        const paperData: Paper = {
            ...paper,
            year,
            authors: stringToAuthors(paper.authors),
            hasPdf: paper.hasPdf === "true",
            backwardReferencedIds: paper.backwardReferencedIds.split(/,\s*/g),
        };

        const updateCall = backendService
            .updatePaper({
                paper: paperData,
                mask: buildFieldMask(paperData, "paper"),
            })
            .response.then((updatedPaper) => {
                originalPaper = stringifyPaper(updatedPaper);
                paper = stringifyPaper(updatedPaper);
            });

        toast.promise(updateCall, {
            loading: "Updating paper...",
            success: "Successfully updated the paper.",
            error: "Failed to update the paper.",
        });

        // Add noop-catch so that promise rejection is not uncaught in tests
        // noop-catch cannot be added before toast.promise because error case wouldn't be handled
        await updateCall
            .catch(() => {})
            .finally(() => {
                isMakingApiCall = false;
            });
    }

    beforeNavigate(({ cancel }) => {
        if (!isPaperModified) return;
        const isConfirmed = confirm(
            "Are you sure you want to leave this page? You have unsaved changes that will be lost.",
        );
        if (!isConfirmed) {
            cancel();
        }
    });
</script>

<!--
@component
`PaperCard` for displaying the details of a paper in the `PaperView` component.
It also provides the functionality to update the paper details.

Usage:
```svelte
    <PaperDetailsCard {loadingPaper} {allowEditModeToggle} {startInEditMode} />
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
                    {#if isMakingApiCall}
                        <LoaderCircle class="animate-spin" />
                    {:else}
                        <Save
                            class={cn(
                                "select-none",
                                isPaperModified ? "hover:cursor-pointer" : "opacity-30",
                            )}
                            aria-label="Save Paper Changes"
                            data-testid="save-paper-changes-btn"
                            onclick={async () => {
                                if (!isPaperModified) return;
                                await updatePaper();
                            }}
                            size={24}
                        />
                    {/if}
                {/if}
                <Pencil
                    class="select-none hover:cursor-pointer"
                    aria-label="Toggle Edit Paper Mode"
                    data-testid="toggle-edit-paper-mode-btn"
                    onclick={() => (isInEditMode = !isInEditMode)}
                    size={24}
                />
            </div>
        {/if}
    {/snippet}
</PaperCard>
