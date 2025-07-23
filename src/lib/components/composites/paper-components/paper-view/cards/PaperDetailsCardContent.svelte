<script lang="ts">
    import Button from "$lib/components/primitives/button/button.svelte";
    import { getNames } from "$lib/utils/common-helper";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import ChevronUp from "lucide-svelte/icons/chevron-up";
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import PaperDetail from "$lib/components/composites/paper-components/paper-view/PaperDetail.svelte";
    import { resource } from "$lib/resource.svelte";
    import ToggleableInput from "$lib/components/composites/input/ToggleableInput.svelte";
    import type { Paper } from "$lib/model/api/paper";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";

    interface Props {
        loadingPaper: Promise<Paper>;
        isInEditMode?: boolean;
    }

    const { loadingPaper, isInEditMode = false }: Props = $props();

    interface BasicInfos {
        Title: string;
        Authors: string;
        Year: string;
        Publisher: string;
    }

    interface AdditionalInfos {
        "Publication Type": string;
        "Publication Name": string;
        "External ID": string;
    }

    // Initialize with width values for Skeletons
    const basicInfos = $derived(
        resource<Paper, BasicInfos>(loadingPaper, {
            initialValue: {
                Title: "w-[6rem] sm:w-[7.5rem] md:w-[11rem] lg:w-[19.8rem]",
                Authors: "w-[4rem] sm:w-[5rem] md:w-[7.3rem] lg:w-[13rem]",
                Year: "w-[2rem] sm:w-[2.5rem] md:w-[3rem] lg:w-[3.5rem]",
                Publisher: "w-[5rem] sm:w-[6rem] md:w-[8.6rem] lg:w-[15rem]",
            },
            onSuccess: (paper) => {
                return {
                    Title: paper.title,
                    Authors: getNames(paper.authors),
                    Year: paper.year.toString(),
                    Publisher: paper.publisher,
                };
            },
            onErrorValue: { Title: "", Authors: "", Year: "", Publisher: "" },
        }),
    );

    // Initialize with width values for Skeletons
    const additionalInfos = $derived(
        resource<Paper, AdditionalInfos>(loadingPaper, {
            initialValue: {
                "Publication Type": "w-[2rem] sm:w-[2.5rem] md:w-[3rem] lg:w-[3.5rem]",
                "Publication Name": "w-[3.5rem] sm:w-[4.8rem] md:w-[7rem] lg:w-[12.5rem]",
                "External ID": "w-[2.5rem] sm:w-[3.25rem] md:w-[5rem] lg:w-[9rem]",
            },
            onSuccess: (paper) => ({
                "Publication Type": paper.publicationType,
                "Publication Name": "N/A",
                "External ID": paper.externalId,
            }),
            onErrorValue: {
                "Publication Type": "",
                "Publication Name": "",
                "External ID": "",
            },
        }),
    );

    let showAdditionalInfos = $state(false);

    function toggleAdditionalInfos() {
        showAdditionalInfos = !showAdditionalInfos;
    }
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
        {#each Object.entries(basicInfos.value) as [key, value] (key)}
            <PaperDetail id={key} {isInEditMode} {key} {loadingPaper} {value} />
        {/each}
        {#if showAdditionalInfos}
            {#each Object.entries(additionalInfos.value) as [key, value] (key)}
                <PaperDetail id={key} {isInEditMode} {key} {loadingPaper} {value} />
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
        {#each [100, 95, 70, 82, 50, 75, 90] as width, i (i)}
            <Skeleton class="flex h-[1.625rem] rounded-full w-[{width}%]" />
        {/each}
    {:then paper}
        <ToggleableInput
            class="h-full"
            isEditable={isInEditMode}
            placeholder="No abstract available"
            value={paper.abstrakt}
        />
    {:catch}
        <ErrorIndicator errorMessage="Couldn't load Abstract" />
    {/await}
</section>
