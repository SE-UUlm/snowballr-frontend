<script lang="ts">
    import type { ProjectInformationInterface } from "$lib/model/component-interfaces";
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import { pluralize } from "$lib/utils/common-helper";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";

    interface ProjectInformationProps {
        projectInformation: Promise<ProjectInformationInterface>;
    }

    const { projectInformation }: ProjectInformationProps = $props();
</script>

<!--
@component
Displays all important information of a project, including
- project name
- project start
- project stage and stage progress
- time in stage and estimated remaining time

Usage:
```svelte
    <ProjectInformation
        {projectInformation}
    />
```
-->
<div class="w-full px-5 py-2 break-words" data-testid="project-information">
    {#await projectInformation}
        <div class="flex flex-col gap-y-3">
            {#each { length: 4 }}
                <Skeleton class="flex h-6 rounded-full" />
            {/each}
        </div>
    {:then information}
        The project <span class="text-emphasized">{information.projectName}</span> started on
        <span class="text-emphasized">
            {information.projectStart.toLocaleString().split(",")[0]}
        </span>
        and you are currently in stage
        <span class="front-medium relative top-1 text-3xl">{information.projectStage}</span>. You
        are working
        <span class="text-emphasized">{information.daysInStage}</span>
        {pluralize(information.daysInStage, "day", "days")} in this stage and reviewed
        <span class="text-emphasized">{information.reviewedPapersInStage}</span>
        /
        <span class="text-emphasized">{information.totalPapersInStage}</span>
        {pluralize(information.totalPapersInStage, "paper", "papers")} so far, so your estimated remaining
        time is <span class="text-emphasized">{information.estimatedRemainingDays}</span>
        {pluralize(information.estimatedRemainingDays, "day", "days")}.
    {:catch}
        <ErrorIndicator errorMessage="Couldn't load project information." />
    {/await}
</div>
