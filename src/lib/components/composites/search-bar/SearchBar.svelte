<script lang="ts">
    import { Input } from "$lib/components/primitives/input/index";
    import Search from "@lucide/svelte/icons/search";
    import { getSearchTextFromURL } from "$lib/utils/search-parameters";
    import { callDebounced, debounce } from "$lib/utils/common-helper";

    interface Props {
        placeholderText?: string;
        onSearch: (searchText: string) => void;
        timeoutInMs?: number;
        liveSearch?: boolean;
        maxLength?: number;
    }

    const {
        placeholderText = "Search",
        onSearch,
        timeoutInMs = 500,
        liveSearch = true,
        maxLength = undefined,
    }: Props = $props();

    let searchInput: string = $state(getSearchTextFromURL());

    const handleNewInput = $derived(
        liveSearch ? debounce(() => onSearch(searchInput), timeoutInMs) : () => {},
    );

    const handleSpecialButtons = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            // Check, whether user pressed the 'Esc' character to clear input and dispatch focus
            searchInput = "";
            callDebounced(() => onSearch(searchInput), 0);

            (document.activeElement as HTMLInputElement).blur();
        }
        if (event.key === "Enter") {
            // Check, whether user pressed 'Enter' to start the search directly (and dispatch focus)
            callDebounced(() => onSearch(searchInput), 0);

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

To limit the amount of calls (if used with backend calls), the search only starts after a
specified timeout in which no other events occur. The default timeout is 500 ms.

Usage:
```svelte
    <SearchBar placeholderText={yourText} onSearch={yourCallback} timeoutInMs={500} />
```
-->
<div class="relative w-full">
    <!-- inspired by https://github.com/shadcn-ui/ui/issues/1562 -->
    <Input
        class="pr-10"
        data-testid="search-bar-input"
        maxlength={maxLength}
        oninput={handleNewInput}
        onkeyup={handleSpecialButtons}
        placeholder={placeholderText}
        type="text"
        bind:value={searchInput}
    />
    <button
        class="absolute top-1/2 right-4 -translate-y-1/2 transform"
        onclick={() => {
            if (searchInput !== "") onSearch(searchInput);
        }}
        type="button"
    >
        <Search class="text-muted-foreground size-4" />
    </button>
</div>
