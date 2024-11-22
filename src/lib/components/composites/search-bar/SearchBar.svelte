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
    const timeout: number = 500;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const processNewInput = (event: KeyboardEvent) => {
        if (event.key == "Escape") {
            // Check, whether user pressed the 'Esc' character to clear input and dispatch focus
            searchInput = "";
            if (timeoutId !== null) clearTimeout(timeoutId);

            (document.activeElement as HTMLInputElement).blur();
        } else if (event.key == "Enter" && searchInput !== "") {
            // Check, whether user pressed 'Enter' to start the search directly (and dispatch focus)
            onSearch(searchInput);
        } else if (searchInput !== "") {
            if (timeoutId !== null) clearTimeout(timeoutId);

            // Wait a certain amount of time and start search, if no new key is pressed
            timeoutId = setTimeout(() => onSearch(searchInput), timeout);
        }
    };
</script>

<!--
@component
Search bar with adaptable placeholder text.

It starts the search on the following events:
  - the user pressed enter
  - the user click the search icon
  - the user enters the search text and wait
If the user enters the 'Esc' key, the search is aborted.

Usage:
```tsx
    <SearchBar placeholderText={yourText} onSearch={yourCallback    } />
```
-->
<div class="relative w-full">
    <!-- inspired by https://github.com/shadcn-ui/ui/issues/1562 -->
    <Input
        type="text"
        placeholder={placeholderText}
        bind:value={searchInput}
        onkeyup={processNewInput}
        class="px-4 py-3 pr-10"
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
