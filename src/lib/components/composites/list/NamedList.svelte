<script lang="ts">
    import type { Snippet } from "svelte";
    import ErrorIndicator from "../utils/ErrorIndicator.svelte";
    import { groupBy } from "$lib/utils/common-helper";
    import { Separator } from "$lib/components/primitives/separator";
    import { cn } from "$lib/utils/shadcn-helper";

    type T = $$Generic; /* eslint-disable-line no-undef */

    interface BaseProps<T> {
        listName: string;
        items: Promise<T[]>;
        listItemComponent: Snippet<[T]>;
        listItemSkeleton: Snippet<[number]>;
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

    interface UngroupedListProps<T> extends BaseProps<T> {
        groupSelector?: never;
        groupLabels?: never;
    }

    interface GroupedListProps<T> extends BaseProps<T> {
        groupSelector: (item: T) => string;
        groupLabels: Promise<Record<string, string>>;
    }

    type NamedListProps<T> = UngroupedListProps<T> | GroupedListProps<T>;

    const {
        listName = "",
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
        groupSelector,
        groupLabels,
    }: NamedListProps<T> = $props();
</script>

<!-- render a group of list items -->
{#snippet itemsGroup(items: T[])}
    {#each items as item (keySelector(item))}
        <li>
            {@render listItemComponent?.(item)}
        </li>
    {/each}
{/snippet}

<!--
@component
Named list with a header and custom list items of type `YourComponent`.

This list component can be used to uniformly format named lists.
Therefore use this component as following:

Usage:
```svelte
    <NamedList
        emptyHint="No project papers."
        groupLabels={projects
                .then((projects) => Object.fromEntries(projects.map(({ project }) => [project.id, project.name])))
                .catch(() => ({}))}
        groupSelector={(paper) => paper.projectId!}
        items={openReviews}
        keySelector={(paper) => paper.paper.id}
        listName="Project papers"
        numberOfSkeletons={10}
        showNumberOfListItems={true}
    >
        {#snippet listItemComponent(componentData)}
            <YourComponent {...componentData} />
        {/snippet}
        {#snippet listItemSkeleton()}
            <YourSkeletonComponent />
        {/snippet}
    </NamedList>
```
`items` is a Promise that resolves to a list of objects of type `T`,
which matches the props expected by `YourComponent`.

If the `showNumberOfListItems` option is enabled (default: `false`),
the list name is suffixed with the item count — either explicitly provided via `numberOfItems`,
or inferred automatically, e.g. "yourListName (10)".

While the list is loading, `numberOfSkeleton` skeleton items are displayed as placeholders.

After loading:
- If items are present, each is rendered using `YourComponent`.
- If the list is empty, an optional `emptyHint` is shown instead.
- If an error occurred, the error message is shown, or a custom hint if provided.

Optional `preListContent` can be rendered between the list title and the list itself, e.g. a search bar.

Items can be grouped by passing a `groupSelector` function, which assigns each item to a group.
Group names are provided via the `groupLabels` map. If a group key returned by `groupSelector`
is not found in the map, the group will be labeled as "Unknown".
-->
<div class="flex h-full w-full flex-col gap-y-5 overflow-hidden">
    {#await items}
        {#if listName}
            <h2>{listName}</h2>
        {/if}
        {@render preListContent?.()}
        <ul class="scroll-box space-y-4 pb-1">
            {#each { length: numberOfSkeletons }, i}
                <li>
                    {@render listItemSkeleton(i)}
                </li>
            {/each}
        </ul>
    {:then loadedItems}
        {#if listName}
            {#if showNumberOfListItems}
                <h2>
                    {listName} ({numberOfItems === undefined ? loadedItems.length : numberOfItems})
                </h2>
            {:else}
                <h2>{listName}</h2>
            {/if}
        {/if}
        {@render preListContent?.()}
        {#if loadedItems.length === 0}
            <span class="text-hint italic">{emptyHint}</span>
        {:else}
            <ul class="scroll-box space-y-4 pb-1">
                {#if groupSelector}
                    {#each Object.entries(groupBy(loadedItems, groupSelector)) as [key, values], index (index)}
                        <!-- show group header before each group and add a gap to the previous group
                             except for first group header that has no previous group -->
                        <div class={cn("space-y-1", index >= 1 ? "mt-6" : "")}>
                            {#await groupLabels}
                                <h2 class="italic">Loading</h2>
                            {:then loadedGroupLabels}
                                <h2>{loadedGroupLabels?.[key] ?? "Unknown"}</h2>
                            {/await}
                            <Separator />
                        </div>
                        {@render itemsGroup(values)}
                    {/each}
                {:else}
                    {@render itemsGroup(loadedItems)}
                {/if}
            </ul>
        {/if}
    {:catch error}
        {console.error(`Couldn't load items: ${error}`)}
        {#if listName}
            <h2>{listName}</h2>
        {/if}
        <ErrorIndicator errorMessage={errorHint ? errorHint : error} />
    {/await}
</div>
