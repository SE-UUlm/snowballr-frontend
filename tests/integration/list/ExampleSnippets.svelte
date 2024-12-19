<script module>
    import ExampleListItem from "./ExampleListItem.svelte";
    import ExampleListItemSkeleton from "./ExampleListItemSkeleton.svelte";

    export { listItemComponent, listItemSkeleton };
</script>

{#snippet listItemComponent(componentData)}
    <ExampleListItem {...componentData} />
{/snippet}

{#snippet listItemSkeleton()}
    <ExampleListItemSkeleton />
{/snippet}
