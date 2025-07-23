<script lang="ts">
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import { cn } from "$lib/utils/shadcn-helper";
    import type { WithElementRef } from "bits-ui";
    import ToggleableInput from "$lib/components/composites/input/ToggleableInput.svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import type { Paper } from "$lib/model/api/paper";
    import ErrorIndicator from "../../utils/ErrorIndicator.svelte";

    type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
        key: string;
        value: unknown;
        loadingPaper: Promise<Paper>;
        isInEditMode: boolean;
    };

    const { key, value, loadingPaper, isInEditMode }: Props = $props();
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
    <span class="w-24 pt-[0.3125rem] xl:w-42">{key}</span>
    {#await loadingPaper}
        <div class="pt-2">
            <Skeleton class={cn("flex h-[1.625rem] rounded-full", value as string)} />
        </div>
    {:then}
        <ToggleableInput isEditable={isInEditMode} {value} />
    {:catch}
        <ErrorIndicator errorMessage={`Couldn't load ${key}`} />
    {/await}
</div>
