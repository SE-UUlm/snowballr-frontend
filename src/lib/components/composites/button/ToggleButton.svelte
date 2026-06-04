<script lang="ts">
    import Button, { type ButtonProps } from "$lib/components/primitives/button/button.svelte";
    import Check from "@lucide/svelte/icons/check";
    import XIcon from "@lucide/svelte/icons/x";

    type Props = ButtonProps & {
        selected: boolean;
        selectedLabel?: string;
        unselectedLabel?: string;
    };

    let {
        selected = $bindable(false),
        selectedLabel = "Selected",
        unselectedLabel = "Unselected",
        ...restProps
    }: Props = $props();

    function toggle() {
        selected = !selected;
    }
</script>

<!--
@component
A button that switches between the two states "selected" and "unselected".

Usage:
```
    <ToggleButton selectedLabel="Include" unselectedLabel="Exclude" bind:selected />
```
-->
<Button
    class={selected ? "border border-transparent" : ""}
    onclick={toggle}
    variant={selected ? "default" : "outline"}
    {...restProps}
>
    {#if selected}
        <Check />{selectedLabel}
    {:else}
        <XIcon />{unselectedLabel}
    {/if}
</Button>
