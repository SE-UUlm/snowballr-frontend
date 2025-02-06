<script lang="ts">
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import type { Paper } from "$lib/model/backend";
    import { cn } from "$lib/utils/shadcn-helper";
    import type { WithElementRef } from "bits-ui";
    import ToggleableInput from "../../input/ToggleableInput.svelte";
    import type { HTMLAttributes } from "svelte/elements";

    type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
        key: string;
        value: unknown;
        loadingPaper: Promise<Paper>;
        areDetailsInEditMode: boolean;
    };

    const { key, value, loadingPaper, areDetailsInEditMode }: Props = $props();
</script>

<!--
@component
Paper Detail component to display a single detail of a paper.

- `value` is used as class value for the skeleton loader while the promise `loadingPaper` is pending.
    When the promise is resolved, the value is displayed as a text.

Usage:
```svelte
    <PaperDetail id={key} {key} {value} {loadingPaper} {areDetailsInEditMode} />
```
-->
<div class="flex flex-row gap-2" data-testid="paper-detail">
    <!-- Match top padding of input -->
    <span class="w-24 xl:w-42 pt-[0.3125rem]">{key}</span>
    {#await loadingPaper}
        <div class="pt-2">
            <Skeleton class={cn("flex h-[1.625rem] rounded-full", value as string)} />
        </div>
    {:then}
        <ToggleableInput isEditable={areDetailsInEditMode} {value} />
    {:catch}
        <span class="pt-2 text-error">Couldn't load {key}</span>
    {/await}
</div>
