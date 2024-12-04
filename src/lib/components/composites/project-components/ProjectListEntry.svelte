<script lang="ts">
    import { Progress } from "$lib/components/primitives/progress";
    import { goto } from "$app/navigation";
    import type { Project, UserSpec } from "$lib/model/backend";

    interface ProjectListEntryProps {
        project: Project;
        members: UserSpec[];
        stage: number;
        projectProgress: number;
    }

    const { project, members, stage, projectProgress }: ProjectListEntryProps = $props();

    /**
     * Combine the first- and lastname of the members array into a string as following:
     * [{firstName: "Max", lastName: "Mustermann", email: "max@mustermann.com"}, ... ] -->
     * "Max Mustermann, ..."
     */
    const getMemberNames = () => {
        return members
            .map((member: UserSpec) => `${member.firstName} ${member.lastName}`)
            .join(", ");
    };
</script>

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
        <Progress class="h-2.5 w-full min-w-16 lg:max-w-32" value={projectProgress} />
    </div>
</button>
