<script lang="ts">
    import * as Tabs from "$lib/components/primitives/tabs/index.js";
    import type { Tab } from "$lib/model/tabs";
    import type { Snippet } from "svelte";

    interface Props {
        tabs: Tab[];
        buttonList?: Snippet;
    }

    const { tabs, buttonList }: Props = $props();

    const totalTabLabelLength = tabs.map((t) => t.label.length).reduce((a, c) => a + c, 0);
    const partialTabSpaces = tabs.map((t) => (t.label.length / totalTabLabelLength) * 100);
</script>

<!--
@component
{@link Tabs.List} but with underlined abd transparent tabs.

Usage:
```svelte
    <UnderlineTabsList
        tabs={[
            { value: "details", label: "Details" },
            { value: "research-context", label: "Research Context" },
        ]}
    >
        {#snippet buttonList()}
            <button>This is a button</button>
        {/snippet}
    </UnderlineTabsList>
```
-->
<div class="inline-flex w-full justify-between gap-2 border-b px-3 pt-3">
    <!-- Set p-0 first to override inherited padding -->
    <Tabs.List class="h-fit w-full justify-start rounded-none bg-transparent p-0">
        {#each tabs as tab, i (tab.value)}
            <Tabs.Trigger
                style={`max-width:${partialTabSpaces[i]}%`}
                class="data-[state=active]:border-b-primary h-fit rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-2 transition-none"
                value={tab.value}
            >
                <span class="truncate" title={tab.label}>{tab.label}</span>
            </Tabs.Trigger>
        {/each}
    </Tabs.List>
    {#if buttonList}
        <div class="flex w-fit items-center">
            {@render buttonList?.()}
        </div>
    {/if}
</div>
