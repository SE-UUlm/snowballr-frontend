<script lang="ts">
    import Button from "$lib/components/primitives/button/button.svelte";
    import type { Paper } from "$lib/model/backend";
    import { getNames } from "$lib/utils/common-helper";
    import PaperCard from "./PaperCard.svelte";
    import PaperCardContent from "./PaperCardContent.svelte";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import ChevronUp from "lucide-svelte/icons/chevron-up";
    import Pencil from "lucide-svelte/icons/pencil";
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import PaperDetail from "$lib/components/composites/paper-components/paper-view/PaperDetail.svelte";
    import AbstractToggleableInput from "$lib/components/composites/input/AbstractToggleableInput.svelte";
    import { resource } from "$lib/resource.svelte";

    interface Props {
        loadingPaper: Promise<Paper>;
        allowEditModeToggle: boolean;
        startInEditMode: boolean;
        showButtonBar: boolean;
    }

    const { loadingPaper, allowEditModeToggle, startInEditMode, showButtonBar }: Props = $props();

    let areDetailsInEditMode = $state(startInEditMode);
    let isAbstractInEditMode = $state(startInEditMode);

    const tabs = [
        { value: "1", label: "Information" },
        { value: "2", label: "Document" },
    ];

    interface BasicInfos {
        Title: string;
        Authors: string;
        Year: string;
        Publisher: string;
    }
    // Initialize with width values for Skeletons
    let basicInfos = resource<Paper, BasicInfos>(loadingPaper, {
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
                Year: paper.year?.toString() ?? "N/A",
                Publisher: "N/A",
            };
        },
        onErrorValue: { Title: "", Authors: "", Year: "", Publisher: "" },
    });

    interface AdditionalInfos {
        "Publication Type": string;
        "Publication Name": string;
        DOI: string;
    }
    // Initialize with width values for Skeletons
    let additionalInfos = resource<Paper, AdditionalInfos>(loadingPaper, {
        initialValue: {
            "Publication Type": "w-[2rem] sm:w-[2.5rem] md:w-[3rem] lg:w-[3.5rem]",
            "Publication Name": "w-[3.5rem] sm:w-[4.8rem] md:w-[7rem] lg:w-[12.5rem]",
            DOI: "w-[2.5rem] sm:w-[3.25rem] md:w-[5rem] lg:w-[9rem]",
        },
        onSuccess: (paper) => ({
            "Publication Type": paper.type ?? "N/A",
            "Publication Name": "N/A",
            DOI: paper.doi ?? "N/A",
        }),
        onErrorValue: {
            "Publication Type": "",
            "Publication Name": "",
            DOI: "",
        },
    });

    let showAdditionalInfos = $state(false);

    function toggleAdditionalInfos() {
        showAdditionalInfos = !showAdditionalInfos;
    }
</script>

<!--
@component
Paper Card for paper details in the Paper View component.

Usage:
```svelte
    <PaperDetailsCard {paper} allowEditModeToggle startInEditMode />
```
-->
<PaperCard {tabs} data-testid="paper-details-card">
    <PaperCardContent value="1">
        <section class="flex flex-col gap-2 px-1">
            <div class="flex flex-row justify-between items-center">
                <h2>General Information</h2>
                {#if allowEditModeToggle}
                    <Pencil
                        size={20}
                        onclick={() => (areDetailsInEditMode = !areDetailsInEditMode)}
                        class="hover:cursor-pointer select-none"
                    />
                {/if}
            </div>
            <div class="flex flex-col gap-2">
                {#each Object.entries(basicInfos.value) as [key, value]}
                    <PaperDetail id={key} {key} {value} {loadingPaper} {areDetailsInEditMode} />
                {/each}
                {#if showAdditionalInfos}
                    {#each Object.entries(additionalInfos.value) as [key, value]}
                        <PaperDetail id={key} {key} {value} {loadingPaper} {areDetailsInEditMode} />
                    {/each}
                {/if}
            </div>
            <div class="flex justify-center pt-2">
                <Button
                    class="w-fit"
                    variant="outline"
                    onclick={toggleAdditionalInfos}
                    data-testid="toggle-additional-infos-btn"
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
        <section class="flex flex-col gap-2 px-1">
            <div class="flex flex-row justify-between items-center">
                <h2>Abstract</h2>
                {#if allowEditModeToggle}
                    <Pencil
                        size={20}
                        onclick={() => (isAbstractInEditMode = !isAbstractInEditMode)}
                        class="hover:cursor-pointer select-none"
                    />
                {/if}
            </div>
            {#await loadingPaper}
                {#each [100, 95, 70, 82, 50, 75, 90] as width}
                    <Skeleton class="flex h-[1.625rem] rounded-full w-[{width}%]" />
                {/each}
            {:then paper}
                <AbstractToggleableInput
                    isEditable={isAbstractInEditMode}
                    maxHeightActionProps={{ showButtonBar, showAdditionalInfos }}
                    value={paper.abstrakt}
                />
            {:catch}
                <span class="text-error">Couldn't load Abstract</span>
            {/await}
        </section>
    </PaperCardContent>
    <PaperCardContent value="2">
        <span>
            Will be implemented in
            <a class="text-blue-400" href="https://github.com/SE-UUlm/snowballr-frontend/issues/98">
                #98
            </a>
            .
        </span>
    </PaperCardContent>
</PaperCard>
