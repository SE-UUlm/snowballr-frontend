<script lang="ts">
    import type { ProjectInformationInterface } from "$lib/model/component-interfaces";
    import { Skeleton } from "$lib/components/primitives/skeleton";

    interface ProjectInformationProps {
        projectInfos: Promise<ProjectInformationInterface>;
    }

    const { projectInfos }: ProjectInformationProps = $props();
</script>

<div class="w-full px-5 py-2 break-words">
    {#await projectInfos}
        <Skeleton class="rounded-full h-5 w-[100px]" />
    {:then projectInfos}
        The project <span class="text-emphasized">{projectInfos.projectName}</span> started at
        <span class="text-emphasized">
            {projectInfos.projectStart.toLocaleString().split(",")[0]}
        </span>
        and you are currently in stage
        <span class="text-3xl front-medium relative top-1">{projectInfos.projectStage}</span>. You
        are working
        <span class="text-emphasized">{projectInfos.daysInStage}</span>
        days in this stage and reviewed
        <span class="text-emphasized">{projectInfos.reviewedPapersInStage}</span>
        /
        <span class="text-emphasized">{projectInfos.totalPapersInStage}</span>
        papers so far, so your estimated remaining time is
        <span class="text-emphasized">{projectInfos.estimatedRemainingDays}</span> days.
    {/await}
</div>
