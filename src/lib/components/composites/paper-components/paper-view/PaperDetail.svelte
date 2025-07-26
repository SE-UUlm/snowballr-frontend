<script lang="ts">
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import { cn } from "$lib/utils/shadcn-helper";
    import type { WithElementRef } from "bits-ui";
    import ToggleableInput from "$lib/components/composites/input/ToggleableInput.svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import type { Paper } from "$lib/model/api/paper";
    import ErrorIndicator from "../../utils/ErrorIndicator.svelte";

    export interface PaperDetailProp {
        key: keyof Paper;
        label: string;
        transform?: (
            value: any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
        ) => string;
    }

    type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
        prop: PaperDetailProp;
        index?: number;
        loadingPaper: Promise<Paper>;
        paper: Paper;
        isInEditMode: boolean;
    };

    let { prop, index = 0, loadingPaper, paper = $bindable(), isInEditMode }: Props = $props();
    const { key, label, transform = undefined } = prop;

    const skeletonValues = [
        "w-[6rem] sm:w-[7.5rem] md:w-[11rem] lg:w-[19.8rem]",
        "w-[4rem] sm:w-[5rem] md:w-[7.3rem] lg:w-[13rem]",
        "w-[2rem] sm:w-[2.5rem] md:w-[3rem] lg:w-[3.5rem]",
        "w-[5rem] sm:w-[6rem] md:w-[8.6rem] lg:w-[15rem]",
        "w-[2rem] sm:w-[2.5rem] md:w-[3rem] lg:w-[3.5rem]",
        "w-[3.5rem] sm:w-[4.8rem] md:w-[7rem] lg:w-[12.5rem]",
        "w-[2.5rem] sm:w-[3.25rem] md:w-[5rem] lg:w-[9rem]",
    ];

    function applyValue() {
        const value = paper[key];
        return transform ? transform(value) : value;
    }

    function updateValue(newValue: string) {
        paper = { ...paper, [key]: newValue };
    }
</script>

<!--
@component
Paper Detail component to display a single detail of a paper.

Usage:
```svelte
    <PaperDetail {key} {label} {loadingPaper} {isInEditMode} bind:paper />
```
-->
<div id={key} class="flex flex-row gap-2" data-testid="paper-detail">
    <!-- Match top padding of input -->
    <span class="w-24 pt-[0.3125rem] xl:w-42">{label}</span>
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
        <ToggleableInput
            isEditable={isInEditMode}
            onInputChange={updateValue}
            placeholder={`No ${label} available`}
            value={applyValue()}
        />
    {:catch}
        <ErrorIndicator errorMessage={`Couldn't load ${label}`} />
    {/await}
</div>
