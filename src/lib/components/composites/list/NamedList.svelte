<script lang="ts">
    import type { Snippet } from "svelte";
    import ErrorIndicator from "../ErrorIndicator.svelte";

    type T = $$Generic; /* eslint-disable-line no-undef */

    interface NamedListProps {
        listName: string;
        items: Promise<T[]>;
        listItemComponent: Snippet<[T]>;
        listItemSkeleton: Snippet;
        numberOfSkeletons: number;
        showNumberOfListItems?: boolean;
        numberOfItems?: number;
        emptyHint?: string;
        errorHint?: string;
        preListContent?: Snippet;
        /**
         * Selects a key of the passed item.
         * All keys created by this function must be unique.
         */
        keySelector: (item: T) => string | number;
    }

    const {
        listName,
        items,
        listItemComponent,
        listItemSkeleton,
        numberOfSkeletons,
        showNumberOfListItems = false,
        numberOfItems = undefined,
        emptyHint = "No items found.",
        errorHint,
        preListContent = undefined,
        keySelector,
    }: NamedListProps = $props();
</script>

<!--
@component
Named list with a header and custom list items of type `YourComponent`.

This list component can be used to uniformly format named lists.
Therefore use this component as following:

Usage:
```svelte
    <NamedList listName={yourListName} items={yourListItems} showNumberOfListItems={true} numberOfItems={10} numberOfSkeletons={10}>
        {#snippet listItemComponent(componentData)}
            <YourComponent {...componentData} />
        {/snippet}
        {#snippet listItemSkeleton()}
            <YourSkeletonComponent />
        {/snippet}
    </NamedList>
```
items is a promise, containing a list of objects of type T, so of the same type
as the props of `YourComponent`.
If the option showNumberOfListItems is set to true (default: false),
the number of list items (either given by 'numberOfItems' or automatically determined)
is added to the list name / header, like 'yourListName (10)'.

While the list is loading, it displays \<numberOfSkeleton\> skeleton list items.
If the loading was successful it either shows the components, filled with the component data
or an optional hint (provided with 'emptyHint') that the list is empty.
Otherwise the error message is shown.

You can render additional content between the title and the list by providing `preListContent`.
This can be e.g. a search bar.
-->
<div class="flex flex-col h-full w-full px-5 gap-y-5 overflow-hidden">
    {#await items}
        <h2>{listName}</h2>
        {@render preListContent?.()}
        <ul class="space-y-4 pb-1 scroll-box">
            {#each { length: numberOfSkeletons }}
                <li>
                    {@render listItemSkeleton()}
                </li>
            {/each}
        </ul>
    {:then loadedItems}
        {#if showNumberOfListItems}
            <h2>{listName} ({numberOfItems === undefined ? loadedItems.length : numberOfItems})</h2>
        {:else}
            <h2>{listName}</h2>
        {/if}
        {@render preListContent?.()}
        {#if loadedItems.length === 0}
            <span class="text-hint italic">{emptyHint}</span>
        {:else}
            <ul class="space-y-4 pb-1 scroll-box">
                {#each loadedItems as item (keySelector(item))}
                    <li>
                        {@render listItemComponent?.(item)}
                    </li>
                {/each}
            </ul>
        {/if}
    {:catch error}
        {console.error(`Could not load items: ${error}`)}
        <h2>{listName}</h2>
        <ErrorIndicator errorMessage={errorHint ? errorHint : error} />
    {/await}
</div>
