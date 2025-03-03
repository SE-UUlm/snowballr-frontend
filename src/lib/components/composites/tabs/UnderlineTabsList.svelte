<script lang="ts">
    import * as Tabs from "$lib/components/primitives/tabs/index.js";
    import type { Tab } from "./tab-props";

    interface Props {
        tabs: Tab[];
    }

    const { tabs }: Props = $props();
</script>

<!--
@component
{@link Tabs.List} but with underlinded abd transparent tabs.

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
    {#each tabs as tab (tab.value)}
        <Tabs.Trigger
            class="data-[state=active]:border-b-primary h-fit max-w-[50%] rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-2 transition-none"
            value={tab.value}
        >
            <div class="truncate">{tab.label}</div>
        </Tabs.Trigger>
    {/each}
</Tabs.List>
