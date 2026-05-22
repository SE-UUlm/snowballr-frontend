<script lang="ts">
    import { getStatusColor, getStatusText, sumBy } from "$lib/utils/common-helper";
    import type { PaperStatus } from "$lib/model/general";
    import * as d3 from "d3";
    import type { StageProgressInterface } from "./StageProgress.svelte";

    interface Segment {
        decision: PaperStatus | "No decision";
        value: number;
    }

    const { stage, decisions }: StageProgressInterface = $props();

    const totalNumberOfDecisions = $derived(
        sumBy(Object.values(decisions.statistics), (statistic) => Number(statistic.count)),
    );
    let segments: Segment[] = $derived(
        Object.values(decisions.statistics).map(({ decision, count }) => ({
            decision: getStatusText(decision),
            value: Number(count) / totalNumberOfDecisions,
        })),
    );
    const possibleDecisions = $derived(
        Object.values(decisions.statistics).map(({ decision }) => decision),
    );

    const SIZE = 152;
    const radius = SIZE / 2;

    const arc = d3
        .arc<d3.PieArcDatum<Segment>>()
        .innerRadius(0.8 * radius)
        .outerRadius(radius)
        .padAngle(0.025)
        .cornerRadius(6);

    const pie = d3
        .pie<Segment>()
        .value((d) => d.value)
        .sort(null);

    let colorScale = $derived(
        d3
            .scaleOrdinal<string>()
            .domain(possibleDecisions.map((decision) => getStatusText(decision)))
            .range(possibleDecisions.map((decision) => getStatusColor(decision, "text"))),
    );

    // Check whether the stage was just created and no decisions can be shown
    function initializeSegmentsAndColorScale() {
        if (totalNumberOfDecisions === 0) {
            segments = [
                {
                    decision: "No decision",
                    value: 1,
                },
            ];
            colorScale = d3.scaleOrdinal<string>().domain("No decision").range(["text-gray-200"]);
        }
    }

    initializeSegmentsAndColorScale();
</script>

<svg data-testid="stage-progress-chart" height={SIZE} width={SIZE}>
    <!-- donut chart -->
    <g fill="none" transform={`translate(${SIZE / 2}, ${SIZE / 2})`}>
        {#each pie(segments) as s, i (i)}
            <path
                class={`fill-current ${colorScale(s.data.decision)}`}
                d={arc(s)}
                fill="currentColor"
            ></path>
        {/each}
    </g>
    <!-- stage number in the center of the chart -->
    <text
        class="text-default"
        dominant-baseline="middle"
        dy="-0.75em"
        text-anchor="middle"
        x="50%"
        y="50%"
    >
        Stage
    </text>
    <text class="text-3xl" dominant-baseline="middle" dy="3em" text-anchor="middle" x="50%">
        {stage}
    </text>
</svg>
