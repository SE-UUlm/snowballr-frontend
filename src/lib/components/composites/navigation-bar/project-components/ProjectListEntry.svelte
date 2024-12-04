<script lang="ts">
    import { Progress } from "$lib/components/primitives/progress";
    import { goto } from "$app/navigation";

    const projectName = "Project 1";
    const projectId = 12;
    const members = ["Leonhard Alkewitz", "Felix Schlegel"];
    const stage = 3;
    const progress = 70;
</script>

<button
    type="button"
    class="flex flex-col lg:flex-row h-fit w-full gap-x-4 lg:gap-y-1 items-start lg:items-center justify-between px-5 py-2 border border-container-border-grey rounded-md hover:bg-container-border-grey/35"
    onclick={() => goto(`/project/${projectId}/dashboard`)}
>
    <div class="flex flex-col h-fit w-fit items-start">
        <h2 class="truncate">{projectName}</h2>

        <div class="text-hint truncate">
            {#if members.length > 0}
                <span class="truncate">{members.join(", ")}</span>
            {:else}
                <span class="italic">no members</span>
            {/if}
        </div>
    </div>
    <div
        class="flex flex-row w-full gap-x-5 lg:gap-x-2.5 items-center justify-start lg:justify-end"
    >
        <span class="h-fit w-fit text-nowrap">Stage {stage}</span>
        <Progress class="h-2.5 w-full min-w-16 lg:max-w-32" value={progress} />
    </div>
</button>
