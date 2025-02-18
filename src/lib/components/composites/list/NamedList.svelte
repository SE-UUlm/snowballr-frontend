<script lang="ts">
    import type { Snippet } from "svelte";
    import { CircleAlert } from "lucide-svelte";
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
    }: NamedListProps = $props();
</script>

<!--@component
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
            <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
            {#each Array(numberOfSkeletons) as _}
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
                {#each loadedItems as item}
                    <li>
                        {@render listItemComponent?.(item)}
                    </li>
                {/each}
            </ul>
        {/if}
    {:catch error}
        {console.error(`Could not load items: ${error}`)}
        <h2>{listName}</h2>
        <div class="flex flex-row items-center gap-x-2 p-4">
            <CircleAlert size={20} class="text-neutral-500" />
            <span class="text-error">{errorHint ? errorHint : error}</span>
        </div>
    {/await}
</div>
