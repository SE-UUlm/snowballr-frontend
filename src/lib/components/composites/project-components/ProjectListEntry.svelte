<script lang="ts">
    import { Progress } from "$lib/components/primitives/progress";
    import { goto } from "$app/navigation";
    import type { Project, User } from "$lib/model/backend";

    interface ProjectListEntryProps {
        project: Project;
        members: User[];
        stage: number;
        stageProgress: number;
    }

    const { project, members, stage, stageProgress }: ProjectListEntryProps = $props();

    /**
     * Combine the first- and lastname of the members array into a string as following:
     * [{firstName: "John", lastName: "Doe", email: "john@doe.com"}, ... ] -->
     * "John Doe, ..."
     */
    const getMemberNames = () => {
        return members.map((member: User) => `${member.firstName} ${member.lastName}`).join(", ");
    };
</script>

<!--
@component
Container displaying important project information.

This component shows the
  - project id and name
  - members of the project
  - current stage
  - current stage progress (as progress bar, whereas the parameter must be provided as percentage)

Furthermore this component is clickable and navigates to the corresponding project homepage.

Usage:
```svelte
    <ProjectListEntry project={demoProject} members={memberUserSpecArray} stage={3} stageProgress={70} />
```
-->
<button
    type="button"
    class="flex flex-col lg:flex-row h-fit w-full gap-3 lg:gap-10 items-start lg:items-center justify-between px-5 py-2 border border-container-border-grey rounded-md hover:bg-container-border-grey/35"
    onclick={() => goto(`/project/${project.id}/dashboard`)}
>
    <div class="flex flex-col h-fit w-fit items-start">
        <h2 class="truncate">{project.name}</h2>

        <div class="text-hint truncate">
            {#if members.length > 0}
                <span class="truncate">{getMemberNames()}</span>
            {:else}
                <span class="italic">no members</span>
            {/if}
        </div>
    </div>
    <div
        class="flex flex-row w-full gap-x-5 lg:gap-x-2.5 items-center justify-start lg:justify-end"
    >
        <span class="h-fit w-fit text-nowrap">Stage {stage}</span>
        <Progress class="h-2.5 w-full min-w-16 lg:max-w-32" value={stageProgress} />
    </div>
</button>
