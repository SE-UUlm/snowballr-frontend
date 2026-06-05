<script lang="ts">
    import * as Dialog from "$lib/components/primitives/dialog/index.js";
    import Button, { buttonVariants } from "$lib/components/primitives/button/button.svelte";
    import CirclePlus from "@lucide/svelte/icons/circle-plus";
    import Search from "@lucide/svelte/icons/search";
    import Trash from "@lucide/svelte/icons/trash";
    import LoadingButton from "../button/LoadingButton.svelte";
    import { cn } from "$lib/utils/shadcn-helper";
    import SearchBar from "../search-bar/SearchBar.svelte";
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import { backendService } from "$lib/grpc-api";
    import { type Paper } from "$lib/model/api/paper";
    import { isGrpcError, pluralize } from "$lib/utils/common-helper";
    import Separator from "$lib/components/primitives/separator/separator.svelte";
    import Alert from "../utils/Alert.svelte";
    import { toast } from "svelte-sonner";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import type { RpcError } from "@protobuf-ts/runtime-rpc";
    import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";
    import type { DialogTriggerProps } from "bits-ui";
    import ToggleButton from "../button/ToggleButton.svelte";
    import type { Project } from "$api/project";
    import { onMount } from "svelte";

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
    let searchedPapers: Promise<Paper[]> = $state(Promise.resolve([]));
    let selectedPapers: Paper[] = $state([]);
    let loading = $state(false);
    let disableFetcherSearching = $state(true);

    type ErrorResult = { type: "error"; message: string };
    type CreatePaperResult = { type: "success"; paper: Paper } | ErrorResult;
    type AddPaperResult = { type: "success" } | ErrorResult;

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

    async function searchPapers(query: string): Promise<Paper[]> {
        const onError = (error: Error, searchType: string) => {
            searchError = createActionError(
                `Failed to search for ${searchType} papers`,
                {
                    action: `searching for ${searchType} papers`,
                },
                error,
            );

            return [];
        };

        searchError = undefined;

        const localPapers = includeLocal
            ? backendService
                  .searchLocalProjectPaperCandidates({ query, projectId })
                  .response.then((it) => it.papers)
                  .catch((it) => onError(it, "local"))
            : Promise.resolve<Paper[]>([]);

        // Fetcher papers that don't exist in the snowballR DB get their index assigned as ID
        const fetcherPapers =
            includeFetchers && !disableFetcherSearching
                ? backendService
                      .searchFetcherProjectPaperCandidates({ query, projectId })
                      .response.then((it) =>
                          it.papers.map((paper, i) => ({
                              ...paper,
                              id: `${paper.id === "" ? i : paper.id}`,
                          })),
                      )
                      .catch((it) => onError(it, "fetcher"))
                : Promise.resolve<Paper[]>([]);

        function isSamePaper(a: Paper, b: Paper) {
            const doBothHaveId = a.id !== "" && b.id !== "";

            if (doBothHaveId && a.id === b.id) return true;

            const doBothHaveExternalId = a.externalId !== "" && b.externalId !== "";

            return doBothHaveExternalId && a.externalId === b.externalId;
        }

        const papers = Promise.all([localPapers, fetcherPapers])
            .then(([local, fetchers]) => [
                ...local,
                // Avoid duplicate key when rendering
                ...fetchers.filter((it) => !local.some((l) => isSamePaper(it, l))),
            ])
            .then((papers) => {
                if (papers.length === 0) {
                    toast.info(
                        "The search did not return any papers. Either the query didn't match any papers or all papers" +
                            " that match the query already exist in this project",
                    );
                }

                return papers;
            });

        return papers;
    }

    async function tryCreatePaper(paper: Paper): Promise<CreatePaperResult> {
        // Paper already exists if id is UUID
        if (Number.isNaN(Number(paper.id))) {
            return { type: "success", paper };
        }

        return await backendService
            .createPaper(paper)
            .response.then((paper) => ({ type: "success", paper }) satisfies CreatePaperResult)
            .catch((error: RpcError) => {
                if (isGrpcError(error.code, GrpcStatusCode.ALREADY_EXISTS)) {
                    return { type: "success", paper } satisfies CreatePaperResult;
                } else {
                    return { type: "error", message: error.message } satisfies CreatePaperResult;
                }
            });
    }

    async function tryAddPaper(paper: Paper): Promise<AddPaperResult> {
        return await backendService
            .addPaperToProject({
                paperId: paper.id,
                projectId,
                stage: BigInt(stage),
            })
            .then(() => ({ type: "success" }) satisfies AddPaperResult)
            .catch((error: RpcError) => {
                return { type: "error", message: error.message };
            });
    }

    async function addPapers() {
        loading = true;

        let addedPapers = 0;
        for (const paper of selectedPapers) {
            const createResult = await tryCreatePaper(paper);

            if (createResult.type === "error") {
                toast.error(`Paper '${paper.title}' could not be created.`);
                continue;
            }

            const addResult = await tryAddPaper(paper);

            if (addResult.type === "error") {
                toast.error(`Paper '${paper.title}' could not be added.`);
                continue;
            }

            addedPapers++;
        }

        if (addedPapers > 0) {
            toast.success(
                `Successfully added ${addedPapers} ${pluralize(addedPapers, "paper", "papers")} to the project.`,
            );
        }
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
            open = newOpen;
        }
    }
</script>

{#snippet paperView(
    paper: Paper,
    testid: string,
    buttonTestid: string,
    icon: "plus" | "trash",
    onClick: () => void,
)}
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
            <div class="text-muted-foreground text-xs">
                {paper.year}{paper.publicationName ? ` - ${paper.publicationName}` : ""}
            </div>
        </div>
        <Button data-testid={buttonTestid} onclick={onClick} size="icon" variant="outline">
            {#if icon === "plus"}
                <CirclePlus />
            {:else}
                <Trash class="text-red-400" />
            {/if}
        </Button>
    </div>
{/snippet}

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
