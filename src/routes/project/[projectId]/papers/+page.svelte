<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
    import Button from "$lib/components/primitives/button/button.svelte";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import ChevronUp from "lucide-svelte/icons/chevron-up";
    import * as Accordion from "$lib/components/primitives/accordion/index.js";
    import * as Card from "$lib/components/primitives/card/index.js";
    import StagesSelect from "$lib/components/composites/select/StagesSelect.svelte";
    import ReviewersSelect from "$lib/components/composites/select/ReviewersSelect.svelte";
    import PublishersSelect from "$lib/components/composites/select/PublishersSelect.svelte";
    import YearsSelect from "$lib/components/composites/select/YearsSelect.svelte";
    import DecisionsSelect from "$lib/components/composites/select/DecisionsSelect.svelte";
    import CriteriaSelect from "$lib/components/composites/select/CriteriaSelect.svelte";
    import type { Project_Paper } from "$lib/model/api/project";
    import Trash from "lucide-svelte/icons/trash-2";
    import StageEntry from "$lib/components/composites/select/StageEntry.svelte";
    import { pluralize } from "$lib/utils/common-helper.js";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import PaperDetailsCardContent from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCardContent.svelte";

    let { data } = $props();
    const {
        user,
        projectId,
        loadingProject,
        loadingCriteria,
        loadingStages,
        loadingYears,
        loadingPublishers,
        loadingReviewers,
    } = data;

    let selectedProjectPaper = $state<Project_Paper | undefined>(undefined);
    let loadingPaper = $derived(
        selectedProjectPaper ? Promise.resolve(selectedProjectPaper.paper!) : undefined,
    );

    const loadingStageCount = loadingProject.then((project) => project.maxStage);

    let showFilters = $state(true);

    interface PapersFilters {
        stages: string[];
        reviewers: string[];
        publishers: string[];
        years: string[];
        decisions: string[];
        criteria: string[];
    }

    const emptyFilters: PapersFilters = {
        stages: [],
        reviewers: [],
        publishers: [],
        years: [],
        decisions: [],
        criteria: [],
    };
    let papersFilters = $state<PapersFilters>(emptyFilters);

    $effect(() => {
        const filters = Object.assign({}, $state.snapshot(papersFilters));
        console.log(filters);
        // TODO: Filter existing papers
        // This is done in https://github.com/SE-UUlm/snowballr-frontend/issues/37
        // and https://github.com/SE-UUlm/snowballr-frontend/issues/38
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
<ProjectNavigationBar defaultTabValue="papers" {loadingProject} {projectId} {user} />
<main class="flex h-full w-full flex-row gap-10 px-4 py-2">
    <div class="flex h-full w-full flex-col gap-5">
        <div class="flex h-fit w-full flex-col gap-2.5">
            <div class="flex flex-row items-center gap-2.5">
                <Button onclick={() => (showFilters = !showFilters)}>
                    Filters
                    {#if showFilters}
                        <ChevronUp class="size-4" />
                    {:else}
                        <ChevronDown class="size-4" />
                    {/if}
                </Button>
                <Button
                    onclick={() => {
                        papersFilters = emptyFilters;
                    }}
                >
                    <Trash />
                    Clear
                </Button>
                <SearchBar
                    onSearch={(searchText) => {
                        // TODO: build filters from search text
                        // This is done in https://github.com/SE-UUlm/snowballr-frontend/issues/37
                        // and https://github.com/SE-UUlm/snowballr-frontend/issues/38
                        console.log(searchText);
                    }}
                    placeholderText="Search paper"
                />
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
                </div>
            {/if}
        </div>
        <div class="h-full w-full">
            {#await loadingStages}
                <span class="text-hint">Loading stages...</span>
            {:then stages}
                <span class="text-hint">
                    {stages.length}
                    {pluralize(stages.length, "Stage", "Stages")}
                </span>
                <Accordion.Root type="multiple">
                    {#each stages as stage (stage.stageIndex)}
                        <StageEntry {projectId} {stage} bind:selectedPaper={selectedProjectPaper} />
                    {/each}
                </Accordion.Root>
            {:catch error}
                {console.error(`Couldn't load stages: ${error}`)}
                <ErrorIndicator errorMessage="Couldn't load stages" />
            {/await}
        </div>
    </div>
    {#if loadingPaper}
        <Card.Root
            class="border-container-border-grey flex h-full w-[60%] flex-col gap-5 p-5 shadow-lg"
        >
            <PaperDetailsCardContent {loadingPaper} />
        </Card.Root>
    {/if}
</main>
