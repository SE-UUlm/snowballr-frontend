<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
    import Button from "$lib/components/primitives/button/button.svelte";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import ChevronUp from "lucide-svelte/icons/chevron-up";
    import * as Accordion from "$lib/components/primitives/accordion/index.js";
    import * as Card from "$lib/components/primitives/card/index.js";
    import StagesSelect from "$lib/components/composites/papers-view/StagesSelect.svelte";
    import ReviewersSelect from "$lib/components/composites/papers-view/ReviewersSelect.svelte";
    import PublishersSelect from "$lib/components/composites/papers-view/PublishersSelect.svelte";
    import YearsSelect from "$lib/components/composites/papers-view/YearsSelect.svelte";
    import DecisionsSelect from "$lib/components/composites/papers-view/DecisionsSelect.svelte";
    import CriteriaSelect from "$lib/components/composites/papers-view/CriteriaSelect.svelte";
    import type { Project_Paper } from "$lib/model/api/project";
    import Trash from "lucide-svelte/icons/trash-2";
    import StageEntry from "$lib/components/composites/papers-view/StageEntry.svelte";

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

    let selectedPaper = $state<Project_Paper | undefined>(undefined);

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
<main class="flex flex-row h-full w-full px-4 py-2 gap-10">
    <div class="flex flex-col w-full h-full gap-5">
        <div class="flex flex-col w-full h-fit gap-2.5">
            <div class="flex flex-row items-center gap-2.5">
                <Button onclick={() => (showFilters = !showFilters)}>
                    Filters
                    {#if showFilters}
                        <ChevronUp class="size-4" />
                    {:else}
                        <ChevronDown class="size-4" />
                    {/if}
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
                <div class="flex flex-row items-center gap-2.5 flex-wrap">
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
                    <Button
                        onclick={() => {
                            papersFilters = emptyFilters;
                        }}
                    >
                        <Trash />
                        Clear Filters
                    </Button>
                </div>
            {/if}
        </div>
        <div class="w-full h-full">
            {#await loadingStages}
                <span class="text-hint">Loading stages...</span>
            {:then stages}
                <span class="text-hint">
                    {`${stages.length} Stage${stages.length !== 1 ? "s" : ""}`}
                </span>
                <Accordion.Root type="multiple">
                    {#each stages as stage (stage.stageIndex)}
                        <StageEntry {projectId} {stage} bind:selectedPaper />
                    {/each}
                </Accordion.Root>
            {:catch error}
                {console.error(`Failed to load stages: ${error}`)}
                <span class="text-error">Failed to load stages</span>
            {/await}
        </div>
    </div>
    {#if selectedPaper}
        <Card.Root class="flex flex-col w-[60%] h-full gap-5 shadow-lg overflow-hidden">
            <Card.Content>
                <!-- TODO: replace with paper details card -->
                <!-- This is done in https://github.com/SE-UUlm/snowballr-frontend/issues/219 -->
                <pre>{JSON.stringify(selectedPaper.paper!, undefined, 2)}</pre>
            </Card.Content>
        </Card.Root>
    {/if}
</main>
