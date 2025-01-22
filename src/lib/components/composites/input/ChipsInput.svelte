<script lang="ts">
    import { Label } from "$lib/components/primitives/label";
    import { Button } from "$lib/components/primitives/button";

    interface ChipsInputProps {
        items: string[];
        label?: string;
        labelPosition?: "top" | "left";
        searchSuggestions?: (arg0: string) => string[];
        placeholder?: string;
    }

    let {
        items = $bindable(),
        label,
        labelPosition = "top",
        searchSuggestions,
        placeholder = "",
    }: ChipsInputProps = $props();

    /*
        Index (from 0 - <length of items>) indicating, which chip is currently selected.
        Index -1 represent the state, that no chip is selected.
    */
    let selectedChipIndex: number = $state(-1);
    let inputText: string = $state("");

    let suggestions: string[] = $state([]);
    /*
        Index (from 0 - <length of suggestions>) indicating, which suggestion is currently selected.
        Index -1 represent the state, that no suggestion is selected.
    */
    let selectedSuggestionIndex: number = $state(-1);

    /**
     * Adds the input to the list of items and add a chip to the visualization,
     * if the input is not a duplicate.
     *
     * Furthermore, it clears the input.
     *
     * @param item the item to add
     */
    function addItem(item: string): void {
        if (item !== "" && !items.includes(item)) {
            items = [...items, item];
            inputText = "";
        }
    }

    /**
     * Removes the item with the given index.
     */
    function removeItem(index: number): void {
        items = items.filter((_, i) => i !== index);
    }

    /**
     * Handles a new (keyboard) input to this component.
     * That means adding a new / removing an item or navigate between the items / suggestions.
     *
     * TODO: for reviewer: if you have a better idea for this handler, i am open for ideas, because
     * i dont like it.
     */
    function handleKeyDown(event: KeyboardEvent): void {
        if (event.key === "Backspace" && inputText === "" && items.length > 0) {
            // delete the last item
            if (selectedChipIndex !== -1) {
                removeItem(selectedChipIndex);
            } else {
                removeItem(items.length - 1);
            }

            document.getElementById("chips-input-" + label)?.focus();
            selectedSuggestionIndex = -1;
            selectedChipIndex = -1;
        } else if (
            event.key === "Tab" ||
            event.key === "Enter" ||
            event.key === "," ||
            event.key === "+"
        ) {
            // add a new item
            event.preventDefault();
            if (selectedSuggestionIndex !== -1) {
                addItem(suggestions[selectedSuggestionIndex]);
                selectedSuggestionIndex = -1;
            } else {
                addItem(inputText.trim());
            }

            document.getElementById("chips-input-" + label)?.focus();
            selectedSuggestionIndex = -1;
            selectedChipIndex = -1;
        } else if (event.key === "ArrowDown") {
            selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestions.length;

            document.getElementById("chips-suggestions-" + label)?.focus();
            selectedChipIndex = -1;
        } else if (event.key === "ArrowUp") {
            selectedSuggestionIndex =
                (selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length;

            document.getElementById("chips-suggestions-" + label)?.focus();
            selectedChipIndex = -1;
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            if (selectedChipIndex === -1) {
                // edge case: no previous selection, so set to last element
                selectedChipIndex = items.length;
            }
            selectedChipIndex = (selectedChipIndex - 1 + items.length) % items.length;

            document.getElementById("chips-input-" + label)?.focus();
            selectedSuggestionIndex = -1;
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            selectedChipIndex = (selectedChipIndex + 1) % items.length;

            document.getElementById("chips-input-" + label)?.focus();
            selectedSuggestionIndex = -1;
        }
    }

    // reapply filter on suggestions after each new input
    $effect(() => {
        if (searchSuggestions !== undefined) {
            let possibleSuggestions = searchSuggestions(inputText.trim().toLowerCase());
            suggestions = possibleSuggestions.filter((suggestion) => !items.includes(suggestion));
        }
    });
</script>

<!--
@component
Input component with chips showing all given input.

If the user provides an input and set it (using ",", "+", "Tab" or "Enter"), a chip will be added
in the input field showing this input. The chip can be deleted either by clicking on the cross or
pressing "Backspace". The user can navigate in the chips using the left and right arrow keys.

Customizations:
- `label` to provide a label, which will be positioned at `labelPosition` ("top" or "left") relative to the input
- `placeholder` to show a placeholder text in the input field
- `searchSuggestions` to propagate a function, which search for a input string and return a string array,
representing an input text, which should be searched in a list of possible suggestions.

If the method `searchSuggestions` is given, the user gets a list of possible inputs beneath the
input field, which can be selected by either clicking on the suggestions or add it like a normal item.
Furthermore, the user can navigate in the suggestions using the up and down arrow keys.

Usage:
```svelte
    <ChipsInput
        bind:items={membersInput}
        label="Members"
        searchSuggestions={filterPossibleMembers}
    />
```
-->
<div class="flex flex-col w-full gap-2">
    <div class="flex {labelPosition === 'top' ? 'flex-col gap-2' : 'flex-row gap-4 items-center'}">
        <Label for={"chips-input-" + label}>{label}</Label>
        <div
            id={"chips-input-" + label}
            class="flex flex-wrap w-full items-center gap-2.5 px-4 {items.length === 0
                ? 'py-2'
                : 'py-1.5'}
                text-default border-input-border-slate bg-background rounded-md border overflow-x-auto"
        >
            <!-- chips -->
            {#each items as item, index}
                <div
                    class="flex items-center {index === selectedChipIndex
                        ? 'bg-slate-300'
                        : 'bg-slate-200'} rounded-full px-3 py-0.5 w-max"
                >
                    {item}
                    <button
                        class="ml-2 text-primary focus:outline-none"
                        onclick={() => removeItem(index)}
                    >
                        &times;
                    </button>
                </div>
            {/each}

            <!-- input for next chip -->
            <input
                id={"chips-input-" + label}
                type="text"
                class="flex-1 min-w-10 max-w-full placeholder:text-placeholder focus:outline-none"
                bind:value={inputText}
                onkeydown={handleKeyDown}
                {placeholder}
            />
        </div>
    </div>
    <!-- suggestions list -->
    {#if suggestions.length > 0 && inputText !== ""}
        <ul id={"chips-suggestions-" + label}>
            {#each suggestions as suggestion, i}
                <Button
                    variant="ghostWithoutHover"
                    class="flex w-full justify-start {selectedSuggestionIndex === i
                        ? 'bg-accent'
                        : ''} text-default"
                    onclick={() => addItem(suggestion)}
                >
                    {suggestion}
                </Button>
            {/each}
        </ul>
    {/if}
</div>
