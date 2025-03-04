<script lang="ts">
    import type { StageProgressInterface } from "$lib/model/component-interfaces";
    import Circle from "lucide-svelte/icons/circle";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import StageProgressSkeleton from "$lib/components/composites/statistics-components/StageProgressSkeleton.svelte";
    import { getStatusColor } from "$lib/utils/common-helper";
    import { type PaperStatus } from "$lib/model/general";
    import StageProgressChart from "$lib/components/composites/statistics-components/StageProgressChart.svelte";

    interface StageProgressChartProps {
        stageProgress: Promise<StageProgressInterface>;
    }

    const { stageProgress }: StageProgressChartProps = $props();
</script>

<!--
@component
Displays the stage progress, i.e. the number of papers unreviewed, undecided, accepted and declined in the current stage.
The stage progress is visualized using
1) a list
2) a donut chart

Usage:
```svelte
    <StageProgress
        {stageProgress}
    />
```
-->
<div class="flex flex-row items-center gap-x-4 p-5">
    {#await stageProgress}
        <StageProgressSkeleton />
    {:then { stage, decisions }}
        <StageProgressChart {decisions} {stage} />
        <ul class="mx-10 space-y-3">
            {#each Object.entries(decisions) as [decision, number] (decision)}
                <li class="flex flex-row items-center">
                    <Circle
                        class="mr-2 {getStatusColor(decision as PaperStatus)}"
                        size={14}
                        strokeWidth={4}
                    />
                    <span class="text-default-sb min-w-[150px]">{decision}:</span>
                    <span class="text-align">{number}</span>
                </li>
            {/each}
        </ul>
    {:catch}
        <ErrorIndicator errorMessage="Couldn't load current stage progress." />
    {/await}
</div>
