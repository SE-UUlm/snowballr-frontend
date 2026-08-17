<script lang="ts">
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import ToggleableInput from "$lib/components/composites/input/ToggleableInput.svelte";
    import SingleSelect from "$lib/components/composites/select/SingleSelect.svelte";
    import Button, { buttonVariants } from "$lib/components/primitives/button/button.svelte";
    import { Badge } from "$lib/components/primitives/badge/index.js";
    import Tooltip from "$lib/components/composites/utils/Tooltip.svelte";
    import * as Dialog from "$lib/components/primitives/dialog/index.js";
    import Plus from "@lucide/svelte/icons/plus";
    import X from "@lucide/svelte/icons/x";
    import Pencil from "@lucide/svelte/icons/pencil";
    import type { Paper } from "$api/paper";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import type { StringifiedPaper } from "$lib/model/general";
    import { EXTERNAL_ID_TYPE_OPTIONS } from "$lib/model/external-id-type";

    interface Props {
        loadingPaper: Promise<Paper>;
        paper: StringifiedPaper;
        isInEditMode: boolean;
    }

    let { loadingPaper, paper = $bindable(), isInEditMode }: Props = $props();

    let isDialogOpen = $state(false);

    const usedTypes = $derived(paper.externalIds.map((externalId) => externalId.type));
    const areAllTypesUsed = $derived(
        EXTERNAL_ID_TYPE_OPTIONS.every((option) => usedTypes.includes(option.value)),
    );
    // A row without a type chosen yet would collide with any other blank row, so only one is
    // allowed to exist at a time.
    const hasEmptyTypeRow = $derived(
        paper.externalIds.some((externalId) => externalId.type === ""),
    );
    const isAddDisabled = $derived(areAllTypesUsed || hasEmptyTypeRow);

    // Types already used by other rows must not be selectable again, to ensure every external ID
    // has a unique type. The type of the row itself is kept in its options so it remains selected,
    // even if it is not (or no longer) part of EXTERNAL_ID_TYPE_OPTIONS.
    function availableTypeOptions(index: number) {
        const { type: currentType, displayType: currentDisplayType } = paper.externalIds[index];
        const options = EXTERNAL_ID_TYPE_OPTIONS.filter(
            (option) => option.value === currentType || !usedTypes.includes(option.value),
        );
        if (currentType !== "" && !options.some((option) => option.value === currentType)) {
            options.unshift({ value: currentType, label: currentDisplayType || currentType });
        }
        return options;
    }

    function updateExternalId(index: number, field: "type" | "value", value: string) {
        paper = {
            ...paper,
            externalIds: paper.externalIds.map((externalId, i) => {
                if (i !== index) return externalId;
                if (field === "type") {
                    const displayType =
                        EXTERNAL_ID_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
                        value;
                    return { ...externalId, type: value, displayType };
                }
                return { ...externalId, value };
            }),
        };
    }

    function addExternalId() {
        paper = {
            ...paper,
            externalIds: [...paper.externalIds, { type: "", displayType: "", value: "" }],
        };
    }

    function removeExternalId(index: number) {
        paper = { ...paper, externalIds: paper.externalIds.filter((_, i) => i !== index) };
    }
</script>

<!--
@component
Displays the external IDs of a paper (e.g. its DOI or URL), each consisting of a `type` and a `value`.

Every external ID is shown as a badge with its type; hovering or clicking a badge reveals its value in a
tooltip. This keeps the display compact no matter how many external IDs a paper has.

In edit mode, an edit button opens a dialog where entries can be added, edited and removed. The type is
picked from a fixed list of options so that no two entries can share the same type.

Usage:
```svelte
    <PaperExternalIds {isInEditMode} {loadingPaper} bind:paper />
```
-->
<div class="flex flex-row gap-2" data-testid="paper-external-ids">
    <span class="flex w-28 flex-row items-start gap-2 pt-2 lg:w-32 xl:w-42">
        <span data-testid="details-label">External IDs</span>
    </span>
    {#await loadingPaper}
        <div class="flex w-full flex-col gap-2 pt-2">
            <Skeleton class="flex h-6.5 w-full rounded-full" />
        </div>
    {:then}
        <div class="flex w-full flex-row flex-wrap items-start gap-2 pt-2">
            {#if paper.externalIds.length === 0}
                <span class="text-sm text-slate-500">No External IDs available</span>
            {:else}
                {#each paper.externalIds as externalId, index (index)}
                    <Tooltip
                        data-testid={`external-id-badge-${index}`}
                        openOnClick
                        triggerSize="fit"
                        triggerVariant="none"
                    >
                        {#snippet trigger()}
                            <Badge variant="outline">{externalId.displayType || "Unknown"}</Badge>
                        {/snippet}
                        {#snippet content()}
                            {externalId.value || "No value"}
                        {/snippet}
                    </Tooltip>
                {/each}
            {/if}
            {#if isInEditMode}
                <Button
                    class="size-5.5"
                    aria-label="Edit External IDs"
                    data-testid="edit-external-ids-btn"
                    onclick={() => (isDialogOpen = true)}
                    size="icon"
                    variant="ghost"
                >
                    <Pencil />
                </Button>
            {/if}
        </div>
    {:catch}
        <ErrorIndicator errorMessage="Couldn't load External IDs" />
    {/await}
</div>

<Dialog.Root bind:open={isDialogOpen}>
    <Dialog.Content class="sm:max-w-xl" data-testid="external-ids-dialog">
        <Dialog.Header>
            <Dialog.Title>Edit External IDs</Dialog.Title>
        </Dialog.Header>
        <div class="flex max-h-[60vh] flex-col gap-2 overflow-y-auto py-2">
            {#each paper.externalIds as externalId, index (index)}
                <div class="flex flex-row gap-2" data-testid={`external-id-row-${index}`}>
                    <div class="w-fit">
                        <SingleSelect
                            categoryLabel="type"
                            options={availableTypeOptions(index)}
                            bind:selectedValue={
                                () => externalId.type,
                                (value) => updateExternalId(index, "type", value)
                            }
                        />
                    </div>
                    <div class="flex-1">
                        <ToggleableInput
                            isEditable
                            key={`external-id-value-${index}`}
                            onInputChange={(value) => updateExternalId(index, "value", value)}
                            placeholder="Value"
                            value={externalId.value}
                        />
                    </div>
                    <Button
                        aria-label="Remove External ID"
                        data-testid={`remove-external-id-btn-${index}`}
                        onclick={() => removeExternalId(index)}
                        size="icon"
                        variant="ghost"
                    >
                        <X />
                    </Button>
                </div>
            {/each}
            <span
                title={hasEmptyTypeRow
                    ? "Select a type for the new row before adding another"
                    : areAllTypesUsed
                      ? "All available types are already used"
                      : ""}
            >
                <Button
                    class="w-fit"
                    data-testid="add-external-id-btn"
                    disabled={isAddDisabled}
                    onclick={addExternalId}
                    variant="outline"
                >
                    <Plus />
                    Add External ID
                </Button>
            </span>
        </div>
        <Dialog.Footer>
            <Dialog.Close
                class={buttonVariants({ variant: "outline" })}
                data-testid="close-external-ids-dialog-btn"
            >
                Done
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
