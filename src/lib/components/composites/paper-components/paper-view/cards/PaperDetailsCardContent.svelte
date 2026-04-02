<script lang="ts">
    import Button from "$lib/components/primitives/button/button.svelte";
    import ChevronDown from "@lucide/svelte/icons/chevron-down";
    import ChevronUp from "@lucide/svelte/icons/chevron-up";
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import PaperDetail, {
        type PaperDetailProp,
    } from "$lib/components/composites/paper-components/paper-view/PaperDetail.svelte";
    import type { Paper } from "$api/paper";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import type { StringifiedPaper } from "$lib/model/general";
    import ToggleableTextArea from "$lib/components/composites/input/ToggleableTextArea.svelte";

    interface Props {
        loadingPaper: Promise<Paper>;
        paper: StringifiedPaper;
        isInEditMode?: boolean;
    }

    let { loadingPaper, paper = $bindable(), isInEditMode = false }: Props = $props();

    const basicInfoProps: PaperDetailProp[] = [
        { key: "title", label: "Title" },
        { key: "authors", label: "Authors" },
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
    const authorHint =
        "Provide authors in the format 'John Doe' or 'Doe, John' and separate them with a semicolon.";
</script>

<!--
@component
Content of the `PaperDetailsCard`, i.e. displays the details.

We require the `loadingPaper` promise to know when the paper is fully loaded, but also need the bound paper state, so
we can modify the paper's properties.

Usage:
```svelte
    <PaperDetailsCardContent {loadingPaper} bind:paper />
```
-->
<section class="flex flex-col gap-2 px-1">
    <div class="flex flex-row items-center justify-between">
        <h2>General Information</h2>
    </div>
    <div class="flex flex-col gap-2 px-5">
        {#each basicInfoProps as prop, index (prop.key)}
            <PaperDetail
                hint={prop.key === "authors" ? authorHint : undefined}
                {index}
                {isInEditMode}
                {loadingPaper}
                {prop}
                bind:paper
            />
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
        <Skeleton class="flex h-6.5 w-full rounded-full" />
        <Skeleton class="flex h-6.5 w-[95%] rounded-full" />
        <Skeleton class="flex h-6.5 w-[70%] rounded-full" />
        <Skeleton class="flex h-6.5 w-[82%] rounded-full" />
        <Skeleton class="flex h-6.5 w-[50%] rounded-full" />
        <Skeleton class="flex h-6.5 w-[75%] rounded-full" />
        <Skeleton class="flex h-6.5 w-[90%] rounded-full" />
    {:then}
        <ToggleableTextArea
            isEditable={isInEditMode}
            key="abstract"
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
