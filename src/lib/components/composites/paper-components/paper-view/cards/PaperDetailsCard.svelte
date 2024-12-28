<script lang="ts">
    import ToggleableInput from "$lib/components/composites/input/ToggleableInput.svelte";
    import Button from "$lib/components/primitives/button/button.svelte";
    import type { Paper } from "$lib/model/backend";
    import { getNames } from "$lib/utils/common-helper";
    import PaperCard from "./PaperCard.svelte";
    import PaperCardContent from "./PaperCardContent.svelte";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import ChevronUp from "lucide-svelte/icons/chevron-up";
    import Pencil from "lucide-svelte/icons/pencil";

    interface Props {
        paper: Paper;
        allowEditModeToggle: boolean;
        startInEditMode: boolean;
    }

    const { paper, allowEditModeToggle, startInEditMode }: Props = $props();

    let areDetailsInEditMode = $state(startInEditMode);
    let isAbstractInEditMode = $state(startInEditMode);

    const tabs = [
        { value: "1", label: "Information" },
        { value: "2", label: "Document" },
    ];

    interface Info {
        label: string;
        value: unknown;
    }

    const basicInfos: Info[] = [
        { label: "Title", value: paper.title },
        { label: "Authors", value: getNames(paper.authors) },
        { label: "Year", value: paper.year },
        { label: "Publisher", value: "..." },
    ];
    const additionalInfos: Info[] = [
        { label: "Publication Type", value: paper.type },
        { label: "Publication Name", value: "..." },
        { label: "DOI", value: paper.doi },
    ];
    let showAdditionalInfos = $state(true);
    let paperInfos: Info[] = $derived(
        showAdditionalInfos ? [...basicInfos, ...additionalInfos] : basicInfos,
    );

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
<PaperCard {tabs}>
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
                {#each paperInfos as { label, value }}
                    <div class="flex flex-row gap-2">
                        <!-- Match top padding of input -->
                        <span class="w-24 pt-[0.3125rem]">{label}</span>
                        <ToggleableInput isEditable={areDetailsInEditMode} {value} />
                    </div>
                {/each}
            </div>
            <div class="flex justify-center">
                <Button class="w-fit" variant="outline" onclick={toggleAdditionalInfos}>
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
            <ToggleableInput isEditable={isAbstractInEditMode} value={paper.abstrakt} />
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
