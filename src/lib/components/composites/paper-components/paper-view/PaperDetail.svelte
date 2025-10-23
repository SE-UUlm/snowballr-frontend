<script lang="ts">
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import { cn } from "$lib/utils/shadcn-helper";
    import type { WithElementRef } from "bits-ui";
    import ToggleableInput from "$lib/components/composites/input/ToggleableInput.svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import type { Paper } from "$lib/model/api/paper";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import type { StringifiedPaper } from "$lib/model/general";
    import CircleHelp from "lucide-svelte/icons/circle-help";
    import Tooltip from "$lib/components/composites/utils/Tooltip.svelte";

    export interface PaperDetailProp {
        key: keyof StringifiedPaper;
        label: string;
    }

    type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
        prop: PaperDetailProp;
        index?: number;
        loadingPaper: Promise<Paper>;
        paper: StringifiedPaper;
        isInEditMode: boolean;
        hint?: string;
    };

    let {
        prop,
        index = 0,
        loadingPaper,
        paper = $bindable(),
        isInEditMode,
        hint = undefined,
    }: Props = $props();
    const { key, label } = prop;

    const skeletonValues = [
        "w-[6rem] sm:w-[7.5rem] md:w-[11rem] lg:w-[19.8rem]",
        "w-[4rem] sm:w-[5rem] md:w-[7.3rem] lg:w-[13rem]",
        "w-[2rem] sm:w-[2.5rem] md:w-[3rem] lg:w-[3.5rem]",
        "w-[5rem] sm:w-[6rem] md:w-[8.6rem] lg:w-[15rem]",
        "w-[2rem] sm:w-[2.5rem] md:w-[3rem] lg:w-[3.5rem]",
        "w-[3.5rem] sm:w-[4.8rem] md:w-[7rem] lg:w-[12.5rem]",
        "w-[2.5rem] sm:w-[3.25rem] md:w-[5rem] lg:w-[9rem]",
    ];

    function updateValue(newValue: string) {
        paper = { ...paper, [key]: newValue };
    }
</script>

<!--
@component
Paper detail component to display a single detail of a paper, e.g., the title or the publisher.

Usage:
```svelte
    <PaperDetail prop={{ key, label }} {loadingPaper} {isInEditMode} bind:paper />
```
-->
<div id={key} class="flex flex-row gap-2" data-testid="paper-detail">
    <!-- Match top padding of input -->
    <span class="flex w-24 flex-row items-center gap-2 pt-[0.3125rem] xl:w-42">
        <span data-testid="details-label">{label}</span>
        {#if hint && isInEditMode}
            <Tooltip
                class="p-0 [&_svg]:size-5"
                aria-label={hint}
                openOnClick
                triggerSize="fit"
                triggerVariant="none"
            >
                {#snippet trigger()}
                    <CircleHelp class="text-neutral-500" />
                {/snippet}
                {#snippet content()}
                    {hint}
                {/snippet}
            </Tooltip>
        {/if}
    </span>
    {#await loadingPaper}
        <div class="pt-2">
            <Skeleton
                class={cn(
                    "flex h-[1.625rem] rounded-full",
                    skeletonValues[index % skeletonValues.length],
                )}
            />
        </div>
    {:then}
        <div class="flex w-full flex-row gap-1">
            <ToggleableInput
                isEditable={isInEditMode}
                {key}
                onInputChange={updateValue}
                placeholder={`No ${label} available`}
                value={paper[key]}
            />
        </div>
    {:catch}
        <ErrorIndicator errorMessage={`Couldn't load ${label}`} />
    {/await}
</div>
