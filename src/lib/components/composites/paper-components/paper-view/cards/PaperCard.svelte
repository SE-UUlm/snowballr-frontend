<script lang="ts">
    import type { Tab } from "$lib/components/composites/tabs/tab-props";
    import UnderlineTabsList from "$lib/components/composites/tabs/UnderlineTabsList.svelte";
    import * as Card from "$lib/components/primitives/card/index.js";
    import * as Tabs from "$lib/components/primitives/tabs/index.js";
    import { cn } from "$lib/utils/shadcn-helper";
    import type { WithElementRef } from "bits-ui";
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";

    type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
        tabs: Tab[];
        children: Snippet;
    };

    const { tabs, children, class: className, ...restProps }: Props = $props();
</script>

<!-- Use PaperCardContent elements as children with values according to the tabs props -->
<!--
@component
Paper Card used in the `PaperView` component.

For each tab in the tabs prop, a tab is created with the label and value of the tab.
The children of the PaperCard component are rendered in the content of the tab.

Usage:
```svelte
    <PaperCard tabs={[{ value: "details", label: "Details" }, { value: "research-context", label: "Research Context" }]}>
        <PaperCardContent value="details">
            <p>Details content</p>
        </PaperCardContent>
        <PaperCardContent value="research-context">
            <p>Research context content</p>
        </PaperCardContent>
    </PaperCard>
```
-->
<Card.Root
    class={cn(className, "shadow-lg border-container-border-grey flex w-full h-full max-w-[50%]")}
    {...restProps}
>
    <section class="flex flex-col h-full w-full">
        <Tabs.Root class="flex flex-col h-full" value={tabs.length === 0 ? "" : tabs[0].value}>
            <UnderlineTabsList {tabs} />
            <Card.Content class="p-5 flex flex-col h-full">
                {@render children()}
            </Card.Content>
        </Tabs.Root>
    </section>
</Card.Root>
