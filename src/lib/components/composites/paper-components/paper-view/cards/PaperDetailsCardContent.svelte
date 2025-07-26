<script lang="ts">
    import Button from "$lib/components/primitives/button/button.svelte";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import ChevronUp from "lucide-svelte/icons/chevron-up";
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import PaperDetail, {
        type PaperDetailProp,
    } from "$lib/components/composites/paper-components/paper-view/PaperDetail.svelte";
    import ToggleableInput from "$lib/components/composites/input/ToggleableInput.svelte";
    import type { Paper } from "$lib/model/api/paper";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import { getNames } from "$lib/utils/common-helper";

    interface Props {
        loadingPaper: Promise<Paper>;
        paper: Paper;
        isInEditMode?: boolean;
    }

    let { loadingPaper, paper = $bindable(), isInEditMode = false }: Props = $props();

    const basicInfoProps: PaperDetailProp[] = [
        { key: "title", label: "Title" },
        { key: "authors", label: "Authors", transform: getNames },
        { key: "year", label: "Year" },
        { key: "publisher", label: "Publisher" },
    ];

    const additionalInfoProps: PaperDetailProp[] = [
        { key: "publicationType", label: "Publication Type" },
        { key: "publicationName", label: "Publication Name" },
        { key: "externalId", label: "External ID" },
    ];

    let showAdditionalInfos = $state(false);
    const toggleAdditionalInfos = () => (showAdditionalInfos = !showAdditionalInfos);
</script>

<!--
@component
Content of the `PaperDetailsCard`, i.e. displays the details.

Usage:
```svelte
    <PaperDetailsCardContent {paper} />
```
-->
<section class="flex flex-col gap-2 px-1">
    <div class="flex flex-row items-center justify-between">
        <h2>General Information</h2>
    </div>
    <div class="flex flex-col gap-2 px-5">
        {#each basicInfoProps as prop, index (prop.key)}
            <PaperDetail {index} {isInEditMode} {loadingPaper} {prop} bind:paper />
        {/each}
        {#if showAdditionalInfos}
            {#each additionalInfoProps as prop, index (prop.key)}
                <PaperDetail {index} {isInEditMode} {loadingPaper} {prop} bind:paper />
            {/each}
        {/if}
    </div>
    <div class="flex justify-center pt-2">
        <Button
            class="w-fit"
            data-testid="toggle-additional-infos-btn"
            onclick={toggleAdditionalInfos}
            variant="outline"
        >
            {#if showAdditionalInfos}
                <ChevronUp />
                Show less information
            {:else}
                <ChevronDown />
                Show more information
            {/if}
        </Button>
    </div>
</section>
<section class="flex flex-[1_1_0] flex-col gap-2 px-1">
    <div class="flex flex-row items-center justify-between">
        <h2>Abstract</h2>
    </div>
    {#await loadingPaper}
        <Skeleton class="flex h-[1.625rem] w-[100%] rounded-full" />
        <Skeleton class="flex h-[1.625rem] w-[95%] rounded-full" />
        <Skeleton class="flex h-[1.625rem] w-[70%] rounded-full" />
        <Skeleton class="flex h-[1.625rem] w-[82%] rounded-full" />
        <Skeleton class="flex h-[1.625rem] w-[50%] rounded-full" />
        <Skeleton class="flex h-[1.625rem] w-[75%] rounded-full" />
        <Skeleton class="flex h-[1.625rem] w-[90%] rounded-full" />
    {:then}
        <ToggleableInput
            class="h-full"
            isEditable={isInEditMode}
            onInputChange={(c) => {
                paper = { ...paper, abstrakt: c };
            }}
            placeholder="No Abstract available"
            value={paper.abstrakt}
        />
    {:catch}
        <ErrorIndicator errorMessage="Couldn't load Abstract" />
    {/await}
</section>
