<script lang="ts">
    import type { Snippet } from "svelte";

    interface NamedListWrapperProps {
        listName: string;
        children: Snippet;
    }

    const { listName, children }: NamedListWrapperProps = $props();
</script>

<!--
@component
List wrapper with a name.

This wrapper could be used to uniformly format named lists.
Therefore use this component as following:

Usage:
```svelte
    <NamedListWrapper listName={yourListName}>
        // your list
    </NamedListWrapper>
```
-->
<section class="flex flex-col h-full w-full px-5 gap-y-4">
    <h2>{listName}</h2>
    {@render children()}
</section>
