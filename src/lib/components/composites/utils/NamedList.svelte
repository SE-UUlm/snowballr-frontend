<script lang="ts">
    import type { Snippet } from "svelte";
    type T = $$Generic; /* eslint-disable-line no-undef */

    interface NamedListProps {
        listName: string;
        items: T[];
        ListItemComponent: Snippet<[T]>;
        showNumberOfListItems?: boolean;
        numberOfItems?: number;
    }

    const {
        listName,
        items,
        ListItemComponent: children,
        showNumberOfListItems = false,
        numberOfItems = -1,
    }: NamedListProps = $props();
</script>

<!--@component
Named list with a header and custom list items of type `YourComponent`.

This list component can be used to uniformly format named lists.
Therefore use this component as following:

Usage:
```svelte
    <NamedList listName={yourListName} items={yourListItems} showNumberOfListItems={true} numberOfItems={10}>
        {#snippet ListItemComponent(componentData)}
            <YourComponent {...componentData} />
        {/snippet}
    </NamedList>
```
items require a list of objects of type T, so of the same type
as the props of `YourComponent`.
If the option showNumberOfListItems is set to true (default: false),
the number of list items (either given by 'numberOfItems' or automatically determined)
is added to the list name / header, like 'yourListName (10)'.
-->
<div class="flex flex-col h-full w-full px-5 gap-y-5">
    {#if showNumberOfListItems}
        <h2>{listName} ({numberOfItems < 0 ? items.length : numberOfItems})</h2>
    {:else}
        <h2>{listName}</h2>
    {/if}
    <ul class="space-y-4 pb-1 scroll-box">
        {#each items as item}
            <li>
                {@render children?.(item)}
            </li>
        {/each}
    </ul>
</div>
