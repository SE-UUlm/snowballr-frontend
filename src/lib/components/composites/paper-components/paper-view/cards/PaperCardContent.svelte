<script lang="ts">
    import * as Tabs from "$lib/components/primitives/tabs/index.js";
    import type { Snippet } from "svelte";

    interface Props {
        value: string;
        children: Snippet;
    }

    const { value, children }: Props = $props();
</script>

<!-- flex cannot be applied to the Tabs.Content element directly, which is why the content is wrapped in another div -->
<!--
@component
Card content used in the Paper Card component.

Usage:
```svelte
    <PaperCardContent value="details">
        <p>Details content</p>
    </PaperCardContent>
```
-->
<Tabs.Content {value} class="h-full overflow-hidden">
    <div class="flex flex-col gap-5 h-full">
        {@render children()}
    </div>
</Tabs.Content>
