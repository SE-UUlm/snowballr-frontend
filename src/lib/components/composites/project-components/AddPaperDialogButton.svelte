<script lang="ts">
    import * as Dialog from "$lib/components/primitives/dialog/index.js";
    import { Button, buttonVariants } from "$lib/components/primitives/button";
    import { CheckIcon, CirclePlus, TrashIcon, XIcon } from "lucide-svelte";
    import LoadingButton from "../button/LoadingButton.svelte";
    import { cn } from "$lib/utils/shadcn-helper";
    import SearchBar from "../search-bar/SearchBar.svelte";
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import { backendService } from "$lib/grpc-api";
    import type { Paper } from "$lib/model/api/paper";
    import { pluralize } from "$lib/utils/common-helper";
    import Separator from "$lib/components/primitives/separator/separator.svelte";
    import Alert from "../utils/Alert.svelte";
    import { toast } from "svelte-sonner";
    import type { ApiError } from "$lib/model/general";

    interface Props {
        projectId: string;
        stage: bigint;
        open?: boolean;
        includeLocal?: boolean;
        includeFetchers?: boolean;
    }

    let {
        projectId,
        stage,
        open = $bindable(false),
        includeLocal = $bindable(false),
        includeFetchers = $bindable(true)
    }: Props = $props();

    let error: ApiError | undefined = $state();
    let searchedPapers: Promise<Paper[]> = $state(Promise.resolve([]));
    let selectedPapers: Paper[] = $state([]);
    let loading = $state(false);

    async function searchPapers(query: string): Promise<Paper[]> {
        const onError = (errorDetails: string, searchType: string) => {
            error = {
                errorTitle: `Error when searching for ${searchType} papers`,
                errorDetails: errorDetails,
            };

            toast.error(error.errorTitle, { description: `${error.errorDetails}` });

            return [];
        };

        error = undefined;

        const localPapers = includeLocal
            ? backendService
                  .searchLocalPapers({ query })
                  .response.then((it) => it.papers)
                  .catch((it) => onError(it, "local"))
            : Promise.resolve([]);

        const fetcherPapers = includeFetchers
            ? backendService
                  .searchFetcherPapers({ query, projectId })
                  .response.then((it) => it.papers)
                  .catch((it) => onError(it, "fetcher"))
            : Promise.resolve([]);

        const papers = Promise.all([localPapers, fetcherPapers]).then(([local, fetchers]) => [
            ...local,
            // Avoid duplicate key when rendering
            ...fetchers.filter((it) => !local.some((l) => it.id === l.id)),
        ]);

        return papers;
    }

    async function addPapers() {
        loading = true;

        try {
            await Promise.all(
                selectedPapers.map((paper) =>
                    backendService.addPaperToProject({
                        paperId: paper.id,
                        projectId,
                        stage: BigInt(stage),
                    }),
                ),
            );
        } catch {
            toast.error("There was an error when adding the papers to the project.");
            return;
        }

        toast.success(
            `Successfully added ${selectedPapers.length} ${pluralize(selectedPapers.length, "paper", "papers")} to the project.`,
        );

        loading = false;
        open = false;
    }

    $effect(() => {
        if (open || !open) {
            selectedPapers = [];
            searchedPapers = Promise.resolve([]);
        }
    });

    function getOpen() {
        return open;
    }

    function setOpen(newOpen: boolean) {
        if (!loading) {
            open = newOpen
        }
    }
</script>

{#snippet toggleButton(name: string, selected: boolean, toggle: () => void)}
    <Button
        class={cn("w-full flex-1", selected ? "border border-transparent" : "")}
        disabled={loading}
        onclick={toggle}
        variant={selected ? "default" : "outline"}
    >
        {#if selected}
            <CheckIcon />
        {:else}
            <XIcon />
        {/if}
        {selected ? "Include" : "Exclude"}
        {name} Database
    </Button>
{/snippet}

{#snippet paperView(paper: Paper, testid: string, buttonTestid: string, icon: "plus" | "trash", onClick: () => void)}
    {@const authorString = paper.authors.map((it) => `${it.firstName} ${it.lastName}`).join(", ")}
    <div
        class="border-muted hover:bg-muted/50 flex flex-row items-center gap-2 rounded-md border p-2"
        data-testid={testid}
    >
        <div class="flex-1">
            <div class="text-sm font-semibold">{paper.title}</div>
            <div class="text-muted-foreground text-xs">
                {authorString === "" ? "Unknown Authors" : authorString}
            </div>
            <div class="text-muted-foreground text-xs">{paper.year} - {paper.publicationName}</div>
        </div>
        <Button onclick={onClick} data-testid={buttonTestid} size="icon" variant="outline">
            {#if icon === "plus"}
                <CirclePlus />
            {:else}
                <TrashIcon class="text-red-400" />
            {/if}
        </Button>
    </div>
{/snippet}

<Dialog.Root bind:open={getOpen, setOpen}>
    <Dialog.Trigger data-testid="dialog-trigger">
        <Button class="w-full">
            <CirclePlus strokeWidth="2.5" />
            Add Paper
        </Button>
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
                    {@render toggleButton(
                        "Local",
                        includeLocal,
                        () => (includeLocal = !includeLocal),
                    )}
                    {@render toggleButton(
                        "Fetchers",
                        includeFetchers,
                        () => (includeFetchers = !includeFetchers),
                    )}
                </div>

                <SearchBar
                    liveSearch={false}
                    onSearch={(query) => (searchedPapers = searchPapers(query))}
                    placeholderText="Search Query"
                />

                <div class="relative size-full overflow-scroll">
                    <div
                        class="overlfow-visible absolute top-0 left-0 flex size-full flex-col gap-2"
                    >
                        {#await searchedPapers}
                            <Skeleton class="h-16 w-full" />
                            <Skeleton class="h-16 w-full" />
                            <Skeleton class="h-16 w-full" />
                            <Skeleton class="h-16 w-full" />
                        {:then searchedPapers}
                            {#each searchedPapers as paper (paper.id)}
                                {#if selectedPapers.every((it) => it.id != paper.id)}
                                    {@render paperView(
                                        paper,
                                        "paper-available-to-be-added",
                                        "add-paper-to-selected",
                                        "plus",
                                        () => (selectedPapers = [...selectedPapers, paper]),
                                    )}
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
                        class="overlfow-visible absolute top-0 left-0 flex size-full flex-col gap-2"
                    >
                        {#each selectedPapers as paper (paper.id)}
                            {@render paperView(
                                paper,
                                "paper-to-be-added",
                                "remove-paper-from-selected",
                                "trash",
                                () =>
                                    (selectedPapers = selectedPapers.filter(
                                        (it) => it.id != paper.id,
                                    )),
                            )}
                        {/each}
                    </div>
                </div>
            </div>
        </div>

        <Dialog.Footer class="gap-2">
            <div class="relative flex-1">
                <div class="absolute w-full">
                    {#if error !== undefined}
                        <Alert
                            details={error.errorDetails}
                            inline
                            title={error.errorTitle}
                            variant="error"
                        />
                    {/if}
                </div>
            </div>
            <Dialog.Close class={buttonVariants({ variant: "outline" })} disabled={loading}>
                Cancel
            </Dialog.Close>
            <LoadingButton
                disabled={selectedPapers.length === 0}
                label={`Add ${selectedPapers.length} ${pluralize(selectedPapers.length, "Paper", "Papers")}`}
                {loading}
                loadingLabel={`Add ${selectedPapers.length} ${pluralize(selectedPapers.length, "Paper", "Papers")}`}
                onclick={() => addPapers()}
            >
                {#snippet icon()}
                    <CirclePlus />
                {/snippet}
            </LoadingButton>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
