<script lang="ts">
    import { Label } from "$lib/components/primitives/label";
    import { Button } from "$lib/components/primitives/button";
    import CircleAlert from "lucide-svelte/icons/circle-alert";
    import type { ValidationResult } from "$lib/model/general";

    interface ChipsInputProps {
        items: string[];
        validate: (input: string) => ValidationResult;
        label?: string;
        labelPosition?: "top" | "left";
        searchSuggestions?: (searchString: string) => string[];
        placeholder?: string;
        resolveAlias?: (item: string) => string | undefined;
        displayItem?: (item: string) => string | undefined;
    }

    let {
        items = $bindable(),
        validate,
        label,
        labelPosition = "top",
        searchSuggestions,
        placeholder = "",
        resolveAlias,
        displayItem = (item) => item,
    }: ChipsInputProps = $props();

    const INPUT_ID = label === undefined ? "chips-input" : "chips-input-" + label;
    const SUGGESTIONS_LIST_ID =
        label === undefined ? "chips-suggestions" : "chips-suggestions-" + label;

    /**
     * Index (from 0 - \<length of items\>) indicating, which chip is currently selected.
     * Index -1 represent the state, that no chip is selected.
     */
    let selectedChipIndex: number = $state(-1);
    let inputText: string = $state("");

    // assume input is valid, until the opposite is not proven by a check
    let isInputValid: boolean = $state(true);
    let errorMessage: string = $state("");

    let suggestions: string[] = $state([]);
    /**
     * Index (from 0 - \<length of suggestions\>) indicating, which suggestion is currently selected.
     * Index -1 represent the state, that no suggestion is selected.
     */
    let selectedSuggestionIndex: number = $state(-1);

    /**
     * Adds the input to the list of items and add a chip to the visualization.
     *
     * The input is only added, if it is not a duplicate and not empty (after trimming).
     * Furthermore, it clears the input.
     *
     * @param item the item to add
     */
    function addItem(item: string): void {
        const isValidNewItem = item.trim() !== "" && !items.includes(item);
        if (!isValidNewItem) {
            return;
        }

        const resolvedAlias = resolveAlias?.(item);
        if (resolvedAlias) {
            item = resolvedAlias;
        }

        items = [...items, item];
        inputText = "";
    }

    /**
     * Removes the item with the given index.
     */
    function removeItem(index: number): void {
        items = items.filter((_, i) => i !== index);
    }

    /**
     * Calculate the next index based on a given step and maximal index (wrap around).
     */
    function nextIndex(step: number, current: number, max: number) {
        return (current + step + max) % max;
    }

    /**
     * Set the focus to the input field and reset the {@link selectedSuggestionIndex}
     * and optionally the {@link selectedChipIndex} to -1.
     *
     * @param resetChipSelection if true, reset the {@link selectedChipIndex} to -1
     */
    function focusInput(resetChipSelection: boolean = false): void {
        document.getElementById(INPUT_ID)?.focus();
        selectedSuggestionIndex = -1;
        if (resetChipSelection) {
            selectedChipIndex = -1;
        }
    }

    /**
     * Set the focus to the suggestions list and reset the {@link selectedChipIndex} to -1.
     */
    function focusSuggestionsList(): void {
        document.getElementById(SUGGESTIONS_LIST_ID)?.focus();
        selectedChipIndex = -1;
    }

    /**
     * Handles a new (keyboard) input to this component.
     * That means adding a new / removing an item or navigate between the items / suggestions.
     */
    function handleKeyDown(event: KeyboardEvent): void {
        isInputValid = true;
        switch (event.key) {
            case "Backspace":
                if (inputText === "" && items.length > 0) {
                    // delete the last item
                    if (selectedChipIndex !== -1) {
                        removeItem(selectedChipIndex);
                    } else {
                        removeItem(items.length - 1);
                    }
                    focusInput(true);
                }
                break;

            case "Tab":
            case "Enter":
            case ",":
            case "+":
                // add a new item
                event.preventDefault();
                if (suggestions.length > 0 && selectedSuggestionIndex !== -1) {
                    addItem(suggestions[selectedSuggestionIndex]);
                } else {
                    const validationResult = validate(inputText);
                    if (validationResult.success) {
                        addItem(inputText);
                    } else {
                        isInputValid = validationResult.success;
                        errorMessage = validationResult.error;
                    }
                }
                focusInput(true);
                break;

            case "ArrowDown":
            case "ArrowUp":
                if (suggestions.length === 0) {
                    break;
                }
                selectedSuggestionIndex = nextIndex(
                    event.key === "ArrowDown" ? 1 : -1,
                    selectedSuggestionIndex,
                    suggestions.length,
                );

                focusSuggestionsList();
                break;

            case "ArrowLeft":
            case "ArrowRight":
                if (inputText !== "") {
                    break;
                }
                event.preventDefault();
                if (event.key === "ArrowLeft" && selectedChipIndex === -1) {
                    // edge case: no previous selection, so set to last element
                    selectedChipIndex = items.length;
                }
                selectedChipIndex = nextIndex(
                    event.key === "ArrowLeft" ? -1 : 1,
                    selectedChipIndex,
                    items.length,
                );

                focusInput();
                break;
        }
    }

    // reapply filter on suggestions after each new input
    $effect(() => {
        if (searchSuggestions !== undefined) {
            const possibleSuggestions = searchSuggestions(inputText.trim().toLowerCase());
            suggestions = possibleSuggestions.filter((suggestion) => !items.includes(suggestion));
        }
    });
</script>

<!--
@component
Input component with chips showing all given input.

If the user provides an input and set it (using ",", "+", "Tab" or "Enter"), a chip will be added,
in the input field showing this input, if it is valid, i.e. pass the check by the provided `validate` function.
The chip can be deleted either by clicking on the cross or pressing "Backspace".
The user can navigate in the chips using the left and right arrow keys.

Customizations:
- `label` to provide a label, which will be positioned at `labelPosition` ("top" or "left") relative to the input
- `placeholder` to show a placeholder text in the input field
- `searchSuggestions` to optionally propagate a function, which search for a input string and return a string array,
representing an input text, which should be searched in a list of possible suggestions.
- `resolveAlias` to optionally propagate a function, which map the input to a possibly different
value.
- `displayItem` to optionally propagate a function, which map the value of the item to a different
value that is displayed in the chips list

If the method `searchSuggestions` is given, the user gets a list of possible inputs beneath the
input field, which can be selected by either clicking on the suggestions or add it like a normal item.
Furthermore, the user can navigate in the suggestions using the up and down arrow keys.

The method `resolveAlias` can be useful, if you want allow multiple inputs or aliases for one item,
e. g. if allow to input either the full name or the email of a user (= data) to create a user item
represented by the email (= representation).
If you want this representation to be shown by another value, you can use the `displayItem` method
to map this value to another value shown to the user.

Usage:
```svelte
    <ChipsInput
        bind:items={membersInput}
        label="Members"
        searchSuggestions={filterPossibleMembers}
    />
```
-->
<div class="flex flex-col w-full gap-2" data-testid="chips-input-component">
    <div
        class="flex {labelPosition === 'top' ? 'flex-col gap-2' : 'flex-row gap-4 items-center'}"
        data-testid="chips-input-container"
    >
        <Label for={INPUT_ID}>{label}</Label>
        <div
            class="flex flex-wrap w-full items-center gap-2.5 px-4 {items.length === 0
                ? 'py-2'
                : 'py-1.5'}
                text-default border-input-border-slate bg-background rounded-md border overflow-x-auto"
        >
            <!-- chips -->
            {#each items as item, index (item)}
                <div
                    class="flex items-center {index === selectedChipIndex
                        ? 'bg-slate-300'
                        : 'bg-slate-200'} rounded-full px-3 py-0.5 w-max"
                    data-testid={"chip-" + index}
                >
                    {displayItem(item)}
                    <button
                        type="button"
                        class="ml-2 text-primary focus:outline-none"
                        onclick={() => removeItem(index)}
                    >
                        &times;
                    </button>
                </div>
            {/each}

            <!-- input for next chip -->
            <input
                id={INPUT_ID}
                data-testid={INPUT_ID}
                type="text"
                class="flex-1 min-w-10 max-w-full placeholder:text-placeholder focus:outline-none"
                bind:value={inputText}
                onkeydown={handleKeyDown}
                {placeholder}
            />
        </div>
    </div>
    {#if !isInputValid}
        <div class="flex flex-row w-full gap-2 text-red-500">
            <CircleAlert class="w-5 h-5" data-testid="validation-fail" />
            <p class="text-sm" data-testid="error-message">
                {errorMessage}
            </p>
        </div>
    {/if}
    <!-- suggestions list -->
    {#if suggestions.length > 0 && inputText !== ""}
        <ul
            id={SUGGESTIONS_LIST_ID}
            class="border rounded-md max-h-[160px] overflow-y-scroll"
            data-testid={SUGGESTIONS_LIST_ID}
        >
            {#each suggestions as suggestion, i (suggestion)}
                <Button
                    variant="ghostWithoutHover"
                    class="flex w-full justify-start {selectedSuggestionIndex === i
                        ? 'bg-accent'
                        : ''} text-default"
                    onclick={() => {
                        addItem(suggestion);
                        focusInput(true);
                    }}
                    data-testid={"suggestion-" + i}
                >
                    {suggestion}
                </Button>
            {/each}
        </ul>
    {/if}
</div>
