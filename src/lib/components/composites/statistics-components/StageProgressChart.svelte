<script lang="ts">
    import type { StageProgressInterface } from "$lib/model/component-interfaces";
    import Circle from "lucide-svelte/icons/circle";
    import type { PaperStatus } from "$lib/model/general";
    import { exhaustiveCheck } from "$lib/utils/common-helper";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import StageProgressChartSkeleton from "$lib/components/composites/statistics-components/StageProgressChartSkeleton.svelte";

    interface StageProgressChartProps {
        stageProgress: Promise<StageProgressInterface>;
    }

    const { stageProgress }: StageProgressChartProps = $props();

    // Mapping of the decisions to color of chart sections / items in the legend
    function getDecisionColor(color: PaperStatus): string {
        switch (color) {
            case "Accepted":
                return "text-accept-green";
            case "Declined":
                return "text-decline-red";
            case "Undecided":
                return "text-maybe-yellow";
            case "Not reviewed":
                return "text-unreviewed-gray";
            default:
                exhaustiveCheck(color);
        }
    }
</script>

<!--
@component
Displays the stage progress, i.e. the number of papers unreviewed, undecided, accepted and declined in the current stage.
The stage progress is visualized using
1) a list
2) a donut chart

Usage:
```svelte
    <StageProgressChart
        {stageProgress}
    />
```
-->
<div class="flex flex-row gap-x-4 p-5">
    {#await stageProgress}
        <StageProgressChartSkeleton />
    {:then { stage, decisions }}
        Chart mit Stage {stage} in der Mitte
        <ul class="mx-10 space-y-2">
            {#each Object.entries(decisions) as [decision, number] (decision)}
                <li class="flex flex-row items-center">
                    <Circle
                        class="mr-2 {getDecisionColor(decision as PaperStatus)}"
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
