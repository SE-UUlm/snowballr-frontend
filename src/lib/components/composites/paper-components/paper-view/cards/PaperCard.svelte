<script lang="ts">
    import * as Card from "$lib/components/primitives/card/index.js";
    import * as Tabs from "$lib/components/primitives/tabs/index.js";
    import type { Snippet } from "svelte";

    interface Props {
        tabs: {
            value: string;
            label: string;
        }[];
        children: Snippet;
    }
    const { tabs, children }: Props = $props();
</script>

<!-- Use PaperCardContent elements as children with values according to the tabs props -->
<Card.Root class="shadow-lg border-container-border-grey w-full h-full">
    <Tabs.Root value={tabs.length == 0 ? "" : tabs[0].value}>
        <!-- Set p-0 first to override inherited padding -->
        <!-- TODO: make tabs scrollable, when overflowing -->
        <Tabs.List
            class="w-full h-fit justify-start rounded-none border-b b-2 bg-transparent p-0 px-3 pt-3"
        >
            {#each tabs as tab}
                <Tabs.Trigger
                    value={tab.value}
                    class="data-[state=active]:border-b-primary h-fit rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-2 transition-none"
                >
                    {tab.label}
                </Tabs.Trigger>
            {/each}
        </Tabs.List>
        <Card.Content class="p-5">
            {@render children()}
        </Card.Content>
    </Tabs.Root>
</Card.Root>
