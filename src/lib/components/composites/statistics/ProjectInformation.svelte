<script lang="ts">
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import { pluralize } from "$lib/utils/common-helper";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";

    export interface ProjectInformationInterface {
        projectName: string;
        projectStart: Date;
        projectStage: bigint;
        daysInStage: number;
        estimatedRemainingDays: number;
        totalPapersInStage: number;
        reviewedPapersInStage: number;
    }

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
        The project started on
        <span class="text-emphasized">{information.projectStart.toLocaleDateString()}</span>
        and you are in stage
        <span class="text-emphasized">{information.projectStage}</span>. You are currently working
        <span class="text-emphasized">{information.daysInStage}</span>
        {pluralize(information.daysInStage, "day", "days")} in this stage and have reviewed
        <span class="text-emphasized">{information.reviewedPapersInStage}</span>
        /
        <span class="text-emphasized">{information.totalPapersInStage}</span>
        {pluralize(information.totalPapersInStage, "paper", "papers")} so far.
        {#if information.estimatedRemainingDays > 0}
            Based on your progress, your estimated remaining time will be
            <span class="text-emphasized">
                {Math.round(information.estimatedRemainingDays * 10) / 10}
            </span>
            {pluralize(information.estimatedRemainingDays, "day", "days")}.
        {/if}
    {:catch error}
        <ErrorIndicator errorMessage={error.message} />
    {/await}
</div>
