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

    let selectedChipIndex: number = $state(-1);
    let inputText: string = $state("");

    let suggestions: string[] = $state([]);
    let selectedSuggestionIndex: number = $state(-1);

    function addItem(item: string): void {
        if (item !== "" && !items.includes(item)) {
            // check, whether suggestion was selected
            if (selectedSuggestionIndex !== -1) {
                items = [...items, suggestions[selectedSuggestionIndex]];
            } else {
                items = [...items, item];
            }
            inputText = "";
        }
    }

    function removeItem(index: number): void {
        items = items.filter((_, i) => i !== index);
    }

    function handleKeyDown(event: KeyboardEvent): void {
        if (event.key === "Backspace" && inputText === "" && items.length > 0) {
            // handle delete options
            document.getElementById("chips-suggestions-" + label)?.blur();
            items = items.slice(0, items.length - 1);
            selectedChipIndex = -1;
        } else if (
            event.key === "Tab" ||
            event.key === "Enter" ||
            event.key === "," ||
            event.key === "+"
        ) {
            // handle add options
            event.preventDefault();
            document.getElementById("chips-suggestions-" + label)?.blur();
            selectedChipIndex = -1;
            addItem(inputText.trim());
        } else if (event.key === "ArrowDown") {
            document.getElementById("chips-suggestions-" + label)?.focus();
            selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestions.length;
            selectedChipIndex = -1;
        } else if (event.key === "ArrowUp") {
            document.getElementById("chips-suggestions-" + label)?.focus();
            selectedSuggestionIndex =
                (selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length;
            selectedChipIndex = -1;
        } else if (event.key === "ArrowLeft") {
            document.getElementById("chips-suggestions-" + label)?.blur();
            if (selectedChipIndex === -1) {
                // edge case: no previous selection, so set to last element
                selectedChipIndex = items.length;
            }
            selectedChipIndex = (selectedChipIndex - 1 + items.length) % items.length;
        } else if (event.key === "ArrowRight") {
            document.getElementById("chips-suggestions-" + label)?.blur();
            selectedChipIndex = (selectedChipIndex + 1) % items.length;
        }
    }

    $effect(() => {
        if (searchSuggestions !== undefined) {
            suggestions = searchSuggestions(inputText.trim().toLowerCase());
        }
    });
</script>

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
            <!-- Chips -->
            {#each items as item, index}
                <!-- TODO: find better design for the Chips -->
                <div
                    class="flex items-center {index === selectedChipIndex
                        ? 'bg-slate-300'
                        : 'bg-slate-200'} rounded-full px-3 py-0.5 w-max"
                >
                    {item}
                    <!-- Cancel button -->
                    <button
                        class="ml-2 text-primary focus:outline-none"
                        onclick={() => removeItem(index)}
                    >
                        &times;
                    </button>
                </div>
            {/each}

            <!-- Input for next Chip -->
            <input
                type="text"
                class="flex-1 min-w-10 max-w-full placeholder:text-placeholder focus:outline-none"
                bind:value={inputText}
                onkeydown={handleKeyDown}
                {placeholder}
            />
        </div>
    </div>
    <!-- Suggestions list -->
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
