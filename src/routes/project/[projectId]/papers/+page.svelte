<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
    import PaperListEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
    import * as Accordion from "$lib/components/primitives/accordion/index.js";
    import Button from "$lib/components/primitives/button/button.svelte";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import ChevronUp from "lucide-svelte/icons/chevron-up";
    import * as Card from "$lib/components/primitives/card/index.js";
    import StagesSelect from "./StagesSelect.svelte";
    import ReviewersSelect from "./ReviewersSelect.svelte";
    import PublishersSelect from "./PublishersSelect.svelte";
    import YearsSelect from "./YearsSelect.svelte";
    import DecisionsSelect from "./DecisionsSelect.svelte";
    import CriteriaSelect from "./CriteriaSelect.svelte";
    import { resource } from "$lib/resource.svelte";
    import type { Project_Paper } from "$lib/model/api/project";

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

    const stagesResource = resource(loadingStages, {
        initialValue: [],
        onSuccess: (stages) => stages,
        onErrorValue: [],
    });
    let stagesHint = $derived.by(() => {
        const stagesCount = stagesResource.value.length;
        return `${stagesCount} Stage${stagesCount > 1 ? "s" : ""}`;
    });
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

    let papersFilters = $state<PapersFilters>({
        stages: [],
        reviewers: [],
        publishers: [],
        years: [],
        decisions: [],
        criteria: [],
    });

    $effect(() => {
        const filters = Object.assign({}, $state.snapshot(papersFilters));
        console.log(filters);
        // Filter existing papers
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
<ProjectNavigationBar {user} {projectId} {loadingProject} defaultTabValue="papers" />
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
                    placeholderText="Search paper"
                    onSearch={(searchText) => {
                        // TODO: build filters from search text
                        console.log(searchText, $state.snapshot(papersFilters));
                    }}
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
                </div>
            {/if}
        </div>
        <div class="w-full h-full">
            <span class="text-hint">
                {stagesHint}
            </span>
            <Accordion.Root type="multiple">
                {#each stagesResource.value as stage (stage.stageIndex)}
                    <Accordion.Item value={`stage-${stage.stageIndex}`}>
                        <!-- TODO: Add amount of filtered/all e.g. (3/7) -->
                        <Accordion.Trigger>
                            <div class="flex flex-row w-full justify-between">
                                <span>Stage {stage.stageIndex}</span>
                                <span>({stage.papers.length} papers)</span>
                            </div>
                        </Accordion.Trigger>
                        <Accordion.Content>
                            <div class="flex flex-col pl-5 gap-4">
                                {#each stage.papers as paper (paper.id)}
                                    <PaperListEntry
                                        {paper}
                                        {projectId}
                                        showReviewStatus
                                        onClick={() => {
                                            selectedPaper = paper;
                                        }}
                                    />
                                {/each}
                                <!-- TODO: Add 'add paper' button -->
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                {/each}
            </Accordion.Root>
        </div>
    </div>
    {#if selectedPaper}
        <Card.Root class="flex flex-col w-[60%] h-full gap-5 shadow-lg">
            <Card.Content>
                <!-- TODO: replace with paper details card -->
                <h2>General Information</h2>
                <div class="flex flex-col gap-2.5">
                    <div class="flex flex-row justify-between items-center">
                        <h3>Number of Papers</h3>
                        <p>4</p>
                    </div>
                    <div class="flex flex-row justify-between items-center">
                        <h3>Number of Reviews</h3>
                        <p>8</p>
                    </div>
                    <div class="flex flex-row justify-between items-center">
                        <h3>Number of Decisions</h3>
                        <p>4</p>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>
    {/if}
</main>
