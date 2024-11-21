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
<Tabs.Content {value}>
    <div class="flex flex-col gap-5">
        {@render children()}
    </div>
</Tabs.Content>
