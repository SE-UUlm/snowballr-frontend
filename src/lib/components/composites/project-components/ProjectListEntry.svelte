<script lang="ts">
    import { Progress } from "$lib/components/primitives/progress";
    import { getNames, handleSingleOrDoubleClick } from "$lib/utils/common-helper";
    import { ProjectStatus } from "$lib/model/api/project";
    import type { ProjectListEntryInterface } from "$lib/model/component-interfaces";
    import { goto } from "$app/navigation";

    type ProjectListEntryProps = ProjectListEntryInterface & {
        onClick?: () => void;
    };

    const { project, membersList, information, onClick }: ProjectListEntryProps = $props();

    const href = `/project/${project.id}/dashboard`;
</script>

<!--
@component
Container displaying important project information.

This component shows the
  - project name
  - members of the project
  - current stage
  - current stage progress (as progress bar, whereas the parameter must be provided as percentage)

Furthermore this component is clickable and navigates to the corresponding project homepage,
if the onClick() event handler is not overridden. Otherwise it executes the custom event handler
on a single click. A double click always causes the navigation to the paper view.

Usage:
```svelte
    <ProjectListEntry project={demoProject} membersList={memberUserSpecArray} information={{projectProgress: 0.3}} {onClick} />
```
-->
<svelte:element
    this={!onClick ? "a" : "button"}
    class="border-container-border-grey highlight-on-hover flex h-fit w-full flex-col justify-between gap-2 rounded-md border px-5
    py-2 lg:flex-row lg:items-center lg:gap-10"
    class:opacity-25={project.status === ProjectStatus.ARCHIVED}
    onclick={handleSingleOrDoubleClick(onClick ?? (() => {}), () => goto(href))}
    {...!onClick ? { href: href } : { type: "button" }}
>
    <div class="flex h-fit min-w-0 flex-col">
        <h2 class="truncate">{project.name}</h2>

        {#if membersList.members.length > 0}
            <span class="text-hint truncate">
                {getNames(
                    membersList.members
                        .map((member) => member.user)
                        .filter((user) => user !== undefined),
                )}
            </span>
        {:else}
            <span class="italic">no members</span>
        {/if}
    </div>
    <div class="flex w-fit flex-row items-center justify-start gap-x-5 lg:justify-end lg:gap-x-2.5">
        <span class="h-fit w-fit text-nowrap">Stage {project.currentStage}</span>
        <Progress
            class="h-2.5 w-24 bg-slate-200 group-hover/project-list-entry:bg-slate-300 sm:w-28 md:w-48 lg:w-28 xl:w-40 2xl:w-52"
            aria-label="Stage Progress"
            data-testid="stage-progress-bar"
            value={information.projectProgress * 100}
        />
    </div>
</svelte:element>
