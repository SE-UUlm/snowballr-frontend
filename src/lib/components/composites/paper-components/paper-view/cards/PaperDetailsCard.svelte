<script lang="ts">
    import PaperCard from "./PaperCard.svelte";
    import PaperCardContent from "./PaperCardContent.svelte";
    import { Paper } from "$lib/model/api/paper";
    import PaperDetailsCardContent from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCardContent.svelte";
    import Pencil from "@lucide/svelte/icons/pencil";
    import Save from "@lucide/svelte/icons/save";
    import { cn } from "$lib/utils/shadcn-helper";
    import { backendService } from "$lib/grpc-api";
    import { toast } from "svelte-sonner";
    import type { StringifiedPaper } from "$lib/model/general";
    import { asPaper, isProjectPaper, stringifyPaper } from "$lib/utils/model-helper";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import { isStringEqual, stringToAuthors } from "$lib/utils/common-helper";
    import { beforeNavigate } from "$app/navigation";
    import { buildFieldMask } from "$lib/utils/fieldmask-helper";
    import { goto } from "$app/navigation";
    import type { Project_Paper } from "$lib/model/api/project";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";

    interface Props {
        loadingPaper: Promise<Paper>;
        allowEditModeToggle: boolean;
        startInEditMode: boolean;
        isInCreationMode: boolean;
    }

    let { loadingPaper, allowEditModeToggle, startInEditMode, isInCreationMode }: Props = $props();

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    let paper: StringifiedPaper = $state(stringifyPaper(Paper.create()));

    let originalPaper: StringifiedPaper | undefined = $state(undefined);
    let isInEditMode = $derived(startInEditMode);
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
                paper = originalPaper;
            })
            .catch(() => {});
    });

    $effect(() => {
        if ((paper.id === "" && !isInCreationMode) || originalPaper === undefined) {
            return;
        }

        isPaperModified = !isStringEqual(originalPaper, paper);
    });

    const tabs = [
        { value: "1", label: "Information" },
        { value: "2", label: "Document" },
    ];

    async function savePaperModifications() {
        const year = Number(paper.year);
        if (!Number.isInteger(year) || paper.year.trim().length === 0) {
            toast.error("The year has to be a numerical value.");
            return;
        }

        isMakingApiCall = true;

        // Convert stringifiedPaper back to Paper, ensuring correct types
        const paperData: Partial<Paper> = {
            id: paper.id,
            externalId: paper.externalId,
            title: paper.title,
            abstrakt: paper.abstrakt,
            year,
            publisher: paper.publisher,
            publicationName: paper.publicationName,
            publicationType: paper.publicationType,
            authors: stringToAuthors(paper.authors),
            backwardReferencedIds: paper.backwardReferencedIds.split(/,\s*/g),
        };

        let promise;
        if (isInCreationMode) {
            promise = createPaper(Paper.create(paperData));
        } else {
            promise = updatePaper(paperData);
        }

        // Add noop-catch so that promise rejection is not uncaught in tests
        // noop-catch cannot be added before toast.promise because error case wouldn't be handled
        await promise.catch(() => {}).finally(() => (isMakingApiCall = false));
    }

    async function updatePaper(paperData: Partial<Paper>) {
        const updateCall = backendService
            .updatePaper({
                paper: Paper.create(paperData),
                mask: buildFieldMask(paperData, "paper"),
            })
            .response.then((updatedPaper) => {
                originalPaper = stringifyPaper(updatedPaper);
                paper = originalPaper;
            });

        toast.promise(updateCall, {
            loading: "Updating paper...",
            success: "Successfully updated the paper.",
            error: "Failed to update the paper.",
        });

        return updateCall;
    }

    async function createPaper(paperObject: Paper) {
        const projectIdRegex = /\/project\/(.+?)\/.*/;
        const matches = projectIdRegex.exec(window.location.pathname);
        const projectId = matches !== null ? matches[1] : undefined;
        const stage = new URLSearchParams(window.location.search).get("stage");

        let promise: Promise<Paper | Project_Paper> = backendService
            .createPaper(paperObject)
            .response.then(async (createdPaper) => {
                originalPaper = stringifyPaper(createdPaper);
                paper = originalPaper;

                return createdPaper;
            });

        toast.promise(promise, {
            loading: "Creating paper...",
            success: (paper) => `Successfully created the paper '${asPaper(paper).title}'.`,
            error: "Failed to create the paper.",
        });

        if (projectId) {
            promise = promise.then(async (createdPaper) => {
                return await backendService.addPaperToProject({
                    paperId: createdPaper.id,
                    projectId: projectId,
                    stage: BigInt(stage ?? ""),
                }).response;
            });

            toast.promise(promise, {
                loading: "Adding paper to project...",
                success: () => "Successfully added the paper to the project.",
                error: "Failed to add the paper to the project.",
            });
        }

        return promise.then(async (paper) => {
            if (isProjectPaper(paper)) {
                await goto(`/project/${projectId}/paper/${paper.localId}`);
            } else {
                await goto(`/paper/${paper.id}`);
            }
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
        {#if allowEditModeToggle && !isProjectArchived}
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
                                await savePaperModifications();
                            }}
                            size={24}
                        />
                    {/if}
                {/if}
                {#if !isInCreationMode}
                    <Pencil
                        class={cn(
                            "select-none",
                            isPaperModified ? "opacity-30" : "hover:cursor-pointer",
                        )}
                        aria-label="Toggle Edit Paper Mode"
                        data-testid="toggle-edit-paper-mode-btn"
                        onclick={() => {
                            if (!isPaperModified) isInEditMode = !isInEditMode;
                        }}
                        size={24}
                    />
                {/if}
            </div>
        {/if}
    {/snippet}
</PaperCard>
