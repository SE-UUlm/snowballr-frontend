<script lang="ts">
    import { Progress } from "$lib/components/primitives/progress";
    import { getNames } from "$lib/utils/common-helper";
    import type { ProjectListEntryInterface } from "$lib/model/general";
    import { ProjectStatus } from "$lib/model/api/project";

    const { project, membersList, statistics }: ProjectListEntryInterface = $props();
</script>

<!--
@component
Container displaying important project information.

This component shows the
  - project name
  - members of the project
  - current stage
  - current stage progress (as progress bar, whereas the parameter must be provided as percentage)

Furthermore this component is clickable and navigates to the corresponding project homepage.

Usage:
```svelte
    <ProjectListEntry project={demoProject} members={memberUserSpecArray} statistics={{projectProgress: 0.3}} />
```
-->
<a
    class="flex flex-col lg:flex-row h-fit w-full gap-2 lg:gap-10 lg:items-center justify-between px-5 py-2
    border border-container-border-grey rounded-md highlight-on-hover {project.status ===
    ProjectStatus.ARCHIVED
        ? 'opacity-25'
        : ''}"
    href={`/project/${project.id}/dashboard`}
>
    <div class="flex flex-col min-w-0 h-fit">
        <h2 class="truncate">{project.name}</h2>

        {#if membersList.members.length > 0}
            <span class="truncate text-hint"
                >{getNames(
                    membersList.members
                        .map((member) => member.user)
                        .filter((user) => user !== undefined),
                )}</span
            >
        {:else}
            <span class="italic">no members</span>
        {/if}
    </div>
    <div class="flex flex-row w-fit gap-x-5 lg:gap-x-2.5 items-center justify-start lg:justify-end">
        <span class="h-fit w-fit text-nowrap">Stage {project.currentStage}</span>
        <Progress
            class="h-2.5 w-24 sm:w-28 md:w-48 lg:w-28 xl:w-40 2xl:w-52 bg-slate-200 group-hover/project-list-entry:bg-slate-300"
            value={statistics.projectProgress}
            data-testid="stage-progress-bar"
            aria-label="Stage Progress"
        />
    </div>
</a>
