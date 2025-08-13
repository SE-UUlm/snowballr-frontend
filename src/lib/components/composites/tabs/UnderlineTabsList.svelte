<script lang="ts">
    import * as Tabs from "$lib/components/primitives/tabs/index.js";
    import type { Tab } from "$lib/model/tabs";

    interface Props {
        tabs: Tab[];
    }

    const { tabs }: Props = $props();

    const totalTabLabelLength = tabs.map((t) => t.label.length).reduce((a, c) => a + c, 0);
    const partialTabSpaces = tabs.map((t) => (t.label.length / totalTabLabelLength) * 100);
</script>

<!--
@component
{@link Tabs.List} but with underlined abd transparent tabs.

Usage:
```svelte
    <Tabs.Root value={tabs.length == 0 ? "" : tabs[0].value}>
        <UnderlineTabsList {tabs} />
        <Tabs.Content value="0">
            <p>Content 0</p>
        </Tabs.Content>
        <Tabs.Content value="1">
            <p>Content 1</p>
        </Tabs.Content>
    </Tabs.Root>
```
-->
<!-- Set p-0 first to override inherited padding -->
<Tabs.List
    class="b-2 h-fit w-full justify-start rounded-none border-b bg-transparent p-0 px-3 pt-3"
>
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
