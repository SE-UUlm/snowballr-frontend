<script lang="ts">
    import { Button } from "$lib/components/primitives/button";
    import ClipboardPaste from "@lucide/svelte/icons/clipboard-paste";
    import SelectionIndicator from "$lib/components/composites/utils/SelectionIndicator.svelte";
    import { Input } from "$lib/components/primitives/input";
    import Label from "$lib/components/primitives/label/label.svelte";

    let {
        name = $bindable(""),
        value = $bindable(""),
        defaultValue,
        onValueChanged = () => {},
        slrSettingsLocked = false,
    }: {
        name: string;
        value: string;
        defaultValue: string;
        onValueChanged?: (value: string) => void;
        slrSettingsLocked?: boolean;
    } = $props();

    const selected = $derived(value !== "");
    const insertable = $derived(value !== defaultValue);
    $effect(() => onValueChanged(value));
</script>

<SelectionIndicator {selected} />
<Label style="scrollbar-width: none;" class="w-full overflow-x-scroll overflow-y-hidden">
    <code>{name}</code>
</Label>
<Input defaultValue={value} disabled={slrSettingsLocked} placeholder={defaultValue} bind:value />
<Button
    disabled={!insertable || slrSettingsLocked}
    onclick={() => (value = defaultValue)}
    variant="ghost"
>
    <ClipboardPaste />
</Button>
