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
            // Check, whether user pressed the 'Esc' character to dispatch focus and clear input
            searchInput = "";
        } else if (event.key == "Enter") {
            // Check, whether user pressed 'Enter' to start the search directly (and dispatch focus)
            onSearch(searchInput);
        } else {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => onSearch(searchInput), timeout);
        }
    };
</script>

<!-- inspired by https://github.com/shadcn-ui/ui/issues/1562 -->
<div class="relative w-full">
    <Input
        type="text"
        placeholder={placeholderText}
        bind:value={searchInput}
        onkeyup={processNewInput}
        class="px-4 py-3 pr-10"
    />
    <button
        class="absolute right-4 top-1/2 transform -translate-y-1/2"
        onclick={() => onSearch(searchInput)}
    >
        <Search class="h-4 w-4 text-muted-foreground" />
    </button>
</div>
