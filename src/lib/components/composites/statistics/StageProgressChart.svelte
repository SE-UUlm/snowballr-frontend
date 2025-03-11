<script lang="ts">
    import type { StageProgressInterface } from "$lib/model/component-interfaces";
    import { getStatusColor } from "$lib/utils/common-helper";
    import type { PaperStatus } from "$lib/model/general";
    import * as d3 from "d3";

    interface Segment {
        decision: PaperStatus;
        value: number;
    }

    const { stage, decisions }: StageProgressInterface = $props();

    const totalNumberOfDecisions = Object.values(decisions).reduce((acc, cur) => acc + cur, 0);
    const segments: Segment[] = Object.entries(decisions).map(([key, numOfDecisions]) => ({
        decision: key as PaperStatus,
        value: numOfDecisions / totalNumberOfDecisions,
    }));

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

    const colorScale = d3
        .scaleOrdinal<string>()
        .domain(Object.keys(decisions))
        .range(Object.keys(decisions).map((key) => getStatusColor(key as PaperStatus, "text")));
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
