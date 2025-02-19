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

    const loadingStageCount = loadingProject.then((project) => project.maxStage);

    let showFilters = $state(true);
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>Papers | {project.name}</title>
    {:catch}
        <title>Papers</title>
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
                <SearchBar placeholderText="Search paper" onSearch={() => {}} />
            </div>
            {#if showFilters}
                <div class="flex flex-row items-center gap-2.5 flex-wrap">
                    <StagesSelect {loadingStageCount} />
                    <ReviewersSelect {loadingReviewers} />
                    <PublishersSelect {loadingPublishers} />
                    <YearsSelect {loadingYears} />
                    <DecisionsSelect />
                    <CriteriaSelect {loadingCriteria} />
                </div>
            {/if}
        </div>
        <div class="w-full h-full">
            <Accordion.Root type="multiple">
                {#each stagesResource.value as stage (stage.stageIndex)}
                    <Accordion.Item value={`stage-${stage.stageIndex}`}>
                        <Accordion.Trigger>Stage {stage.stageIndex}</Accordion.Trigger>
                        <Accordion.Content>
                            <div class="flex flex-col pl-5 gap-4">
                                {#each stage.papers as paper}
                                    <PaperListEntry {paper} {projectId} showReviewStatus />
                                {/each}
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                {/each}
            </Accordion.Root>
        </div>
    </div>
    <Card.Root class="flex flex-col w-[60%] h-full gap-5 shadow-lg hidden">
        <Card.Content>
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
</main>
