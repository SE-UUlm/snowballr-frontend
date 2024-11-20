<script lang="ts">
    import { Input } from "$lib/components/primitives/input/index";
    import { Search } from "lucide-svelte";

    interface Props {
        placeholderText?: string;
    }

    const { placeholderText = "Search" }: Props = $props();

    let searchInput: string = $state("");

    const onSearchInputUpdate = (event: KeyboardEvent) => {
        // Check, whether user pressed the 'Esc' character to clear input
        if (event.key == "Escape") {
            searchInput = "";
        } else {
            console.log(searchInput);
        }
    };
</script>

<!-- inspired by https://github.com/shadcn-ui/ui/issues/1562 -->
<div class="relative w-full">
    <Input
        type="text"
        placeholder={placeholderText}
        bind:value={searchInput}
        onkeyup={onSearchInputUpdate}
        class="px-4 py-3 pr-10"
    />
    <Search
        class="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
    />
</div>
