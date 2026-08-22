<script lang="ts">
    import * as Dialog from "$lib/components/primitives/dialog/index.js";
    import { buttonVariants } from "$lib/components/primitives/button/button.svelte";
    import CirclePlus from "@lucide/svelte/icons/circle-plus";
    import Search from "@lucide/svelte/icons/search";
    import LoadingButton from "../button/LoadingButton.svelte";
    import { cn } from "$lib/utils/shadcn-helper";
    import SearchBar from "../search-bar/SearchBar.svelte";
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import { pluralize } from "$lib/utils/common-helper";
    import Separator from "$lib/components/primitives/separator/separator.svelte";
    import Alert from "../utils/Alert.svelte";
    import type { ActionError } from "$lib/model/action-error";
    import {
        addPaperCandidates,
        searchPaperCandidates,
        type PaperCandidate,
    } from "$lib/model/paper-candidate";
    import type { DialogTriggerProps } from "bits-ui";
    import ToggleButton from "../button/ToggleButton.svelte";
    import type { Project } from "$api/project";
    import { onMount } from "svelte";
    import { invalidate } from "$app/navigation";
    import ProjectPaperCandidate from "./ProjectPaperCandidate.svelte";

    type Props = DialogTriggerProps & {
        projectId: string;
        stage: bigint;
        open?: boolean;
        includeLocal?: boolean;
        includeFetchers?: boolean;
        loadingProject: Promise<Project>;
    };

    let {
        projectId,
        stage,
        open = $bindable(false),
        includeLocal = $bindable(false),
        includeFetchers = $bindable(true),
        loadingProject,
        class: className,
    }: Props = $props();

    let searchError: ActionError = $state();
    let searchedCandidates: Promise<PaperCandidate[]> = $state(Promise.resolve([]));
    let selectedCandidates: PaperCandidate[] = $state([]);
    let loading = $state(false);
    let disableFetcherSearching = $state(true);

    onMount(() => {
        loadingProject.then((project) => {
            const projectFetchers = Object.keys(project.settings?.fetchers ?? {});
            disableFetcherSearching = projectFetchers.length == 0;
            if (disableFetcherSearching) {
                includeLocal = true;
                includeFetchers = false;
            }
        });
    });

    async function search(query: string): Promise<PaperCandidate[]> {
        searchError = undefined;

        const result = await searchPaperCandidates(query, projectId, {
            includeLocal,
            includeFetchers: includeFetchers && !disableFetcherSearching,
        });

        searchError = result.error;

        return result.candidates;
    }

    async function addPapers() {
        loading = true;

        const summary = await addPaperCandidates(selectedCandidates, { projectId, stage });

        if (summary.added > 0) {
            // trigger reload of the page
            invalidate("data:getAllProjectPapersForProject");
        }

        loading = false;
        open = false;
    }

    $effect(() => {
        if (open || !open) {
            selectedCandidates = [];
            searchedCandidates = Promise.resolve([]);
        }
    });

    function getOpen() {
        return open;
    }

    function setOpen(newOpen: boolean) {
        if (!loading) {
            open = newOpen;
        }
    }
</script>

<!--
@component
Button that opens GUI to search for papers in either the local DB or the fetchers.

The user can toggle both sources to either include or exclude them.

Usage:
```svelte
    <AddPaperDialogButton {loadingProject} {projectId} {stage} />
```
-->
<Dialog.Root bind:open={getOpen, setOpen}>
    <Dialog.Trigger
        class={cn(buttonVariants({ variant: "default" }), className)}
        data-testid="dialog-trigger"
    >
        <Search strokeWidth="2.5" />
        Search & Add
    </Dialog.Trigger>

    <Dialog.Content class="flex min-h-[80svh] min-w-[80svw] flex-col" data-testid="dialog-content">
        <Dialog.Header>
            <div class="flex w-full flex-row gap-8">
                <Dialog.Title class="flex-1">Search Papers</Dialog.Title>
                <Dialog.Title class="flex-1">Papers to be Added</Dialog.Title>
            </div>
        </Dialog.Header>

        <div class="flex size-full flex-1 flex-row gap-4">
            <div class="flex flex-1 flex-col gap-2">
                <div class="flex flex-col place-content-center gap-2 xl:flex-row">
                    <ToggleButton
                        class="w-full"
                        selectedLabel="Include Local Database"
                        unselectedLabel="Exclude Local Database"
                        bind:selected={includeLocal}
                    />
                    <span
                        class="w-full"
                        title={disableFetcherSearching ? "No fetchers configured" : ""}
                    >
                        <ToggleButton
                            class="w-full"
                            disabled={disableFetcherSearching}
                            selectedLabel="Include Fetcher Database"
                            unselectedLabel="Exclude Fetcher Database"
                            bind:selected={includeFetchers}
                        />
                    </span>
                </div>

                <SearchBar
                    liveSearch={false}
                    maxLength={50}
                    onSearch={(query) => (searchedCandidates = search(query))}
                    placeholderText="Search Query"
                />

                <div class="relative size-full overflow-scroll">
                    <div
                        class="absolute top-0 left-0 flex size-full flex-col gap-2 overflow-visible"
                    >
                        {#await searchedCandidates}
                            <Skeleton class="h-16 w-full" />
                            <Skeleton class="h-16 w-full" />
                            <Skeleton class="h-16 w-full" />
                            <Skeleton class="h-16 w-full" />
                        {:then candidates}
                            {#each candidates as candidate (candidate.key)}
                                {#if selectedCandidates.every((it) => it.key != candidate.key)}
                                    <ProjectPaperCandidate
                                        action="add"
                                        buttonTestId="add-paper-to-selected"
                                        onClick={() =>
                                            (selectedCandidates = [
                                                ...selectedCandidates,
                                                candidate,
                                            ])}
                                        paper={candidate.paper}
                                        testId="paper-available-to-be-added"
                                    />
                                {/if}
                            {/each}
                        {/await}
                    </div>
                </div>
            </div>

            <Separator class="min-h-full" orientation="vertical" />

            <div class="flex flex-1 flex-col gap-2">
                <div class="relative size-full overflow-scroll">
                    <div
                        class="absolute top-0 left-0 flex size-full flex-col gap-2 overflow-visible"
                    >
                        {#each selectedCandidates as candidate (candidate.key)}
                            <ProjectPaperCandidate
                                action="remove"
                                buttonTestId="remove-paper-from-selected"
                                onClick={() =>
                                    (selectedCandidates = selectedCandidates.filter(
                                        (it) => it.key != candidate.key,
                                    ))}
                                paper={candidate.paper}
                                testId="paper-to-be-added"
                            />
                        {/each}
                    </div>
                </div>
            </div>
        </div>

        <Dialog.Footer class="gap-2">
            <div class="relative flex-1">
                <div class="absolute w-full">
                    {#if searchError !== undefined}
                        <Alert
                            details={searchError.errorDetails}
                            inline
                            title={searchError.errorTitle}
                            variant="error"
                        />
                    {/if}
                </div>
            </div>
            <Dialog.Close class={buttonVariants({ variant: "outline" })} disabled={loading}>
                Cancel
            </Dialog.Close>
            <LoadingButton
                disabled={selectedCandidates.length === 0}
                label={`Add ${selectedCandidates.length} ${pluralize(selectedCandidates.length, "Paper", "Papers")}`}
                {loading}
                loadingLabel={`Add ${selectedCandidates.length} ${pluralize(selectedCandidates.length, "Paper", "Papers")}`}
                onclick={() => addPapers()}
            >
                {#snippet icon()}
                    <CirclePlus />
                {/snippet}
            </LoadingButton>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
