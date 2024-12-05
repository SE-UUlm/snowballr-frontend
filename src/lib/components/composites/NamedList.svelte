<script lang="ts">
    import type { Snippet } from "svelte";
    type T = $$Generic; /* eslint-disable-line no. */

    interface NamedListProps {
        listName: string;
        items: [T];
        ListItemComponent: Snippet<[T]>;
    }

    const { listName, items, ListItemComponent: children }: NamedListProps = $props();
</script>

<!--@component
Named list with a header and custom list items of type `YourComponent`.

This list component can be used to uniformly format named lists.
Therefore use this component as following:

Usage:
```svelte
    <NamedList listName={yourListName} items={yourListItems}>
        {#snippet ListItemComponent(componentData)}
            <YourComponent {...componentData} />
        {/snippet}
    </NamedList>
```

items require a list of objects of type T, so of the same type
as the props of `YourComponent`.
-->
<section class="flex flex-col h-full w-full px-5 gap-y-5">
    <h2>{listName}</h2>
    <ul class="space-y-4">
        {#each items as item}
            <li>{@render children?.(item)}</li>
        {/each}
    </ul>
</section>
