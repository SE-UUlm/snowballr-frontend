<script lang="ts">
    import { Button } from "$lib/components/primitives/button";
    import { ClipboardPaste } from "lucide-svelte";
    import SelectionIndicator from "$lib/components/composites/utils/SelectionIndicator.svelte";
    import { Input } from "$lib/components/primitives/input";
    import Label from "$lib/components/primitives/label/label.svelte";

    let {
        name = $bindable(""),
        value = $bindable(""),
        defaultValue,
        onValueChanged,
    }: {
        name: string;
        value: string;
        defaultValue: string;
        onValueChanged: (value: string) => void;
    } = $props();

    const selected = $derived(value !== "");
    const insertable = $derived(value !== defaultValue);
    $effect(() => onValueChanged(value));
</script>

<SelectionIndicator {selected} />
<Label style="scrollbar-width: none;" class="w-full overflow-x-scroll overflow-y-hidden">
    <code>{name}_XYS</code>
</Label>
<Input defaultValue={value} placeholder={defaultValue} bind:value />
<Button disabled={!insertable} onclick={() => (value = defaultValue)} variant="ghost">
    <ClipboardPaste />
</Button>
