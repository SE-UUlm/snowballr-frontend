<script lang="ts">
    import Input from "$lib/components/composites/input/Input.svelte";

    interface Props {
        onClick: () => void;
    }

    const { onClick }: Props = $props();
</script>

<Input
    inputId="input-id"
    label="Input Label"
    placeholder="Input Placeholder"
    required
    type="text"
    onButtonClick={onClick}
>
    {#snippet buttonContent()}
        <span>This is the button</span>
    {/snippet}
</Input>
