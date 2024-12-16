<script lang="ts">
    import ToggleableInput from "$lib/components/composites/input/ToggleableInput.svelte";
    import Textarea from "$lib/components/primitives/textarea/textarea.svelte";
    import type { Paper } from "$lib/model/backend";
    import { displayAuthors } from "$lib/utils";
    import PaperCard from "./PaperCard.svelte";
    import PaperCardContent from "./PaperCardContent.svelte";

    interface Props {
        paper: Paper;
        allowEditModeToggle: boolean;
        startInEditMode: boolean;
    }

    const { paper, allowEditModeToggle, startInEditMode }: Props = $props();

    let isInEditMode = $state(startInEditMode);

    const tabs = [
        { value: "1", label: "Information" },
        { value: "2", label: "Document" },
    ];

    const basicInfos = [
        { label: "Title", value: paper.title },
        { label: "Authors", value: displayAuthors(paper.authors) },
        { label: "Year", value: paper.year },
        { label: "Publisher", value: "..." },
    ];
    const additionalInfos = [
        { label: "Publication Type", value: paper.type },
        { label: "Publication Name", value: "..." },
        { label: "DOI", value: paper.doi },
    ];
    let infoList = $state(basicInfos);
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
        <section class="flex flex-col gap-2">
            <h2>General Information</h2>
            <table>
                <tbody>
                    {#each infoList as { label, value }}
                        <tr>
                            <td class="py-1 pr-2 flex items-start"><span>{label}</span></td>
                            <td class="py-0.5 pb-1 w-full">
                                <ToggleableInput isReadonly={!isInEditMode} {value} />
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </section>
        <section class="flex flex-col gap-2 overflow-hidden">
            <h2>Abstract</h2>
            <div class="flex h-full overflow-hidden">
                <ToggleableInput isReadonly={!isInEditMode} value={paper.abstrakt} />
            </div>
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
