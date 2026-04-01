<script lang="ts">
    import Circle from "@lucide/svelte/icons/circle";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import { getStatusColor, getStatusText } from "$lib/utils/common-helper";
    import StageProgressChart from "$lib/components/composites/statistics/StageProgressChart.svelte";
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import type { Project_Information_DecisionStatistics } from "$api/project";

    export interface StageProgressInterface {
        stage: bigint;
        decisions: Project_Information_DecisionStatistics;
    }

    interface StageProgressChartProps {
        stageProgress: Promise<StageProgressInterface>;
    }

    const { stageProgress }: StageProgressChartProps = $props();
</script>

<!--
@component
Displays the stage progress, i.e. the number of papers unreviewed, undecided, accepted and declined in the current stage.
The stage progress is visualized using
1) a donut chart
2) and a corresponding legend (= list of decisions with their count)

Usage:
```svelte
    <StageProgress
        {stageProgress}
    />
```
-->
<div
    class="flex flex-row items-center gap-x-4 p-5 max-md:flex-col max-md:gap-y-7"
    data-testid="stage-progress"
>
    {#await stageProgress}
        <Skeleton class="size-38 rounded-full" />
        <div class="mx-10 flex flex-col gap-y-3">
            {#each { length: 4 }}
                <Skeleton class="flex h-6 min-w-[190px] rounded-full" />
            {/each}
        </div>
    {:then { stage, decisions }}
        <StageProgressChart {decisions} {stage} />
        <ul class="mx-10 space-y-3 max-sm:mx-2 md:max-lg:mx-4">
            {#each Object.values(decisions.statistics) as { decision, count } (decision)}
                <li class="flex flex-row items-center">
                    <Circle
                        class={`mr-2 fill-current ${getStatusColor(decision, "text")}`}
                        fill="currentColor"
                        size={14}
                    />
                    <span class="text-default-sb min-w-38 md:max-lg:min-w-30">
                        {getStatusText(decision)}:
                    </span>
                    <span class="text-align">{count}</span>
                </li>
            {/each}
        </ul>
    {:catch error}
        <ErrorIndicator errorMessage={error.message} />
    {/await}
</div>
