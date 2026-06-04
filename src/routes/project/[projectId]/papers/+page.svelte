<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
    import Button from "$lib/components/primitives/button/button.svelte";
    import ChevronDown from "@lucide/svelte/icons/chevron-down";
    import ChevronUp from "@lucide/svelte/icons/chevron-up";
    import * as Accordion from "$lib/components/primitives/accordion/index.js";
    import * as Card from "$lib/components/primitives/card/index.js";
    import StagesSelect from "$lib/components/composites/select/StagesSelect.svelte";
    import ReviewersSelect from "$lib/components/composites/select/ReviewersSelect.svelte";
    import PublishersSelect from "$lib/components/composites/select/PublishersSelect.svelte";
    import YearsSelect from "$lib/components/composites/select/YearsSelect.svelte";
    import DecisionsSelect from "$lib/components/composites/select/DecisionsSelect.svelte";
    import CriteriaSelect from "$lib/components/composites/select/CriteriaSelect.svelte";
    import type { Project_Paper } from "$api/project";
    import Trash from "@lucide/svelte/icons/trash-2";
    import StageEntry from "$lib/components/composites/project-components/StageEntry.svelte";
    import { pluralize } from "$lib/utils/common-helper.js";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import PaperDetailsCardContent from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCardContent.svelte";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import Funnel from "@lucide/svelte/icons/funnel";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import PaperBookmarkButton from "$lib/components/composites/button/PaperBookmarkButton.svelte";
    import Tooltip from "$lib/components/composites/utils/Tooltip.svelte";
    import { fly } from "svelte/transition";
    import { clickOutsideOrEscape } from "$lib/utils/attachments.svelte";
    import type { ProjectPaperFilter } from "$lib/model/general";
    import {
        getFilterFromURL,
        getSearchTextFromURL,
        getSortOptionFromURL,
        updateFiltersParam,
        updateSearchTextParam,
        updateUrlParams,
    } from "$lib/utils/search-parameters";
    import { SvelteURLSearchParams } from "svelte/reactivity";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import type { SortOptionLabel } from "$lib/model/sort-criteria";
    import SortOptionsSelect from "$lib/components/composites/select/SortOptionsSelect.svelte";
    import { sortProjectPaper } from "$lib/utils/sorters";
    import { ALLOWED_SORT_OPTIONS } from "$lib/model/sort-criteria";
    import { updateSortParams } from "$lib/utils/search-parameters.js";
    import { Paper } from "$api/paper.js";
    import { stringifyPaper } from "$lib/utils/model-helper.js";
    import ScrollArea from "$lib/components/primitives/scroll-area/scroll-area.svelte";
    import { resolve } from "$app/paths";

    let { data } = $props();
    const {
        projectId,
        loadingProject,
        loadingCriteria,
        loadingStages,
        loadingYears,
        loadingPublishers,
        loadingReviewers,
    } = $derived(data);

    let selectedPaper = $state<Project_Paper | undefined>(undefined);
    // wrap the selected paper in a promise, as the `PaperDetailsCardContent` needs a loading paper
    let loadingPaper = $derived(selectedPaper ? Promise.resolve(selectedPaper.paper!) : undefined);

    const loadingStageCount = $derived(
        loadingProject.then((project) => project.maxStage).catch(() => -1n),
    );

    let searchText = $state(getSearchTextFromURL());

    const emptyFilters: ProjectPaperFilter = {
        stages: [],
        reviewers: [],
        publishers: [],
        years: [],
        decisions: [],
        criteria: [],
    };
    let papersFilters = $state<ProjectPaperFilter>(getFilterFromURL());
    let showFilters = $state(false);

    let selectedSortOption = $state<SortOptionLabel>(getSortOptionFromURL());

    let searchParameters = new SvelteURLSearchParams(page.url.searchParams.toString());

    $effect(() => {
        updateUrlParams(searchParameters);
    });

    // update query parameters when the user selects / unselects a filter
    $effect(() => {
        searchParameters = updateFiltersParam(
            {
                stages: papersFilters.stages,
                reviewers: papersFilters.reviewers,
                publishers: papersFilters.publishers,
                years: papersFilters.years,
                decisions: papersFilters.decisions,
                criteria: papersFilters.criteria,
            },
            searchParameters,
        );
    });

    // update the query parameters when the user changes the sort option
    $effect(() => {
        searchParameters = updateSortParams(
            searchParameters,
            ALLOWED_SORT_OPTIONS[selectedSortOption],
        );
    });

    onMount(() => {
        showFilters = JSON.stringify(papersFilters) !== JSON.stringify(emptyFilters);
    });
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading project...</title>
    {:then project}
        <title>Papers | {project.name}</title>
    {:catch}
        <title>Failed loading project</title>
    {/await}
</svelte:head>
<ProjectNavigationBar defaultTabValue="papers" {loadingProject} {projectId} />
<main class="flex h-full w-full flex-row gap-10 overflow-x-hidden px-5">
    <div class="flex h-full w-full flex-col gap-5">
        <div class="flex h-fit w-full flex-col gap-2.5">
            <div class="flex gap-[2%]">
                <SearchBar
                    onSearch={(text) => {
                        searchText = text;
                        searchParameters = updateSearchTextParam(searchText, searchParameters);
                    }}
                    placeholderText="Search paper or start with '#' to only search by id"
                    timeoutInMs={0}
                />
                <div class="flex flex-row items-center gap-2.5">
                    <Button onclick={() => (showFilters = !showFilters)}>
                        <Funnel />
                        Filter
                        {#if showFilters}
                            <ChevronUp class="size-4" />
                        {:else}
                            <ChevronDown class="size-4" />
                        {/if}
                    </Button>
                    <SortOptionsSelect bind:selectedSortOption />
                </div>
            </div>
            {#if showFilters}
                <div class="flex flex-row flex-wrap items-center gap-2.5">
                    <StagesSelect {loadingStageCount} bind:selectedStages={papersFilters.stages} />
                    <ReviewersSelect
                        {loadingReviewers}
                        bind:selectedReviewers={papersFilters.reviewers}
                    />
                    <PublishersSelect
                        {loadingPublishers}
                        bind:selectedPublishers={papersFilters.publishers}
                    />
                    <YearsSelect {loadingYears} bind:selectedYears={papersFilters.years} />
                    <DecisionsSelect bind:selectedDecisions={papersFilters.decisions} />
                    <CriteriaSelect
                        {loadingCriteria}
                        bind:selectedCriteria={papersFilters.criteria}
                    />
                    <Button onclick={() => (papersFilters = emptyFilters)}>
                        <Trash />
                        Reset
                    </Button>
                </div>
            {/if}
        </div>
        <ScrollArea class="h-full w-full overflow-y-auto">
            {#await loadingStages}
                <span class="text-hint">Loading stages...</span>
            {:then stages}
                <span class="text-hint">
                    {stages.length}
                    {pluralize(stages, "Stage", "Stages")}
                </span>
                <Accordion.Root class="pr-2.5" type="multiple">
                    {#each stages as { stageIndex, papers } (stageIndex)}
                        <StageEntry
                            filter={papersFilters}
                            {loadingProject}
                            {projectId}
                            {searchText}
                            stage={{
                                stageIndex,
                                papers: sortProjectPaper(
                                    papers,
                                    ALLOWED_SORT_OPTIONS[selectedSortOption],
                                ),
                            }}
                            bind:selectedPaper
                        />
                    {/each}
                </Accordion.Root>
            {:catch}
                <ErrorIndicator errorMessage="Couldn't load stages" />
            {/await}
        </ScrollArea>
    </div>
    {#if loadingPaper && selectedPaper}
        <aside
            class="h-full w-[65%] min-w-75"
            {@attach clickOutsideOrEscape(() => (selectedPaper = undefined))}
            data-testid="paper-details-card"
            transition:fly={{ duration: 200, x: 150, opacity: 0 }}
        >
            <Card.Root
                class="border-container-border-grey relative flex h-full w-full flex-col gap-5 p-5 shadow-lg"
            >
                <PaperDetailsCardContent
                    {loadingPaper}
                    paper={stringifyPaper(selectedPaper.paper ?? Paper.create())}
                />
                <div class="absolute top-5 right-5 flex flex-row gap-2.5">
                    {#await loadingPaper}
                        <LoaderCircle class="animate-spin" />
                    {:then paper}
                        <PaperBookmarkButton paperId={paper.id} />
                    {/await}
                    <a
                        class="flex items-center"
                        href={resolve(`/project/${projectId}/paper/${selectedPaper.localId}`)}
                    >
                        <Tooltip class="[&_svg]:size-6" aria-label="Open paper">
                            {#snippet trigger()}
                                <ExternalLink />
                            {/snippet}
                            {#snippet content()}
                                <p>Open paper</p>
                            {/snippet}
                        </Tooltip>
                    </a>
                </div>
            </Card.Root>
        </aside>
    {/if}
</main>
