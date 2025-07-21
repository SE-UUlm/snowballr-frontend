<script lang="ts">
    import { Check, X } from "lucide-svelte";

    let {
        selected,
    }: {
        selected: boolean;
    } = $props();

    export function setSelected(newValue: boolean) {
        selected = newValue;
    }
</script>

<div
    class="flex size-6 items-center justify-items-center"
    aria-checked={selected}
    aria-readonly="true"
    role="checkbox"
>
    {#if selected}
        <Check class="text-green-500" />
    {:else}
        <X class="text-red-500" />
    {/if}
</div>
