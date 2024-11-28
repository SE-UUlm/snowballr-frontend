<script lang="ts">
    import { Input } from "$lib/components/primitives/input/index";
    import { Search } from "lucide-svelte";

    interface Props {
        placeholderText?: string;
        onSearch: (searchText: string) => void;
    }
    const { placeholderText = "Search", onSearch }: Props = $props();

    let searchInput: string = $state("");

    // timeout in ms to wait after last key input before start search
    const timeoutInMs: number = 500;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleNewInput = () => {
        if (timeoutId !== null) clearTimeout(timeoutId);

        // Wait a certain amount of time and start search, if no new key is pressed
        timeoutId = setTimeout(() => onSearch(searchInput), timeoutInMs);
    };

    const handleSpecialButtons = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            // Check, whether user pressed the 'Esc' character to clear input and dispatch focus
            searchInput = "";
            onSearch(searchInput);
            if (timeoutId !== null) clearTimeout(timeoutId);

            (document.activeElement as HTMLInputElement).blur();
        }
        if (event.key === "Enter") {
            // Check, whether user pressed 'Enter' to start the search directly (and dispatch focus)
            onSearch(searchInput);
            if (timeoutId !== null) clearTimeout(timeoutId);

            (document.activeElement as HTMLInputElement).blur();
        }
    };
</script>

<!--
@component
Search bar with adaptable placeholder text.

It starts the search on the following events:
  - the user presses enter
  - the user clicks the search icon
  - the user enters the search text and waits
If the user enters the 'Esc' key, the search is aborted,
meaning the input is cleared, the search bar loose focus
and the search method is triggered with an empty string,
so if no further handling exist, all elements are retrieved
by the search.

Usage:
```svelte
    <SearchBar placeholderText={yourText} onSearch={yourCallback} />
```
-->
<div class="relative w-full">
    <!-- inspired by https://github.com/shadcn-ui/ui/issues/1562 -->
    <Input
        type="text"
        placeholder={placeholderText}
        bind:value={searchInput}
        oninput={handleNewInput}
        onkeyup={handleSpecialButtons}
        class="pr-10"
    />
    <button
        class="absolute right-4 top-1/2 transform -translate-y-1/2"
        onclick={() => {
            if (searchInput !== "") onSearch(searchInput);
        }}
    >
        <Search class="h-4 w-4 text-muted-foreground" />
    </button>
</div>
