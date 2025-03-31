<script lang="ts">
    import { clickOutsideOrEscape } from "$lib/utils/actions.svelte";

    const { onEvent }: { onEvent: (event: CustomEvent) => void } = $props();
</script>

<div data-testid="outside-action-container">Outside action container</div>
<div data-testid="action-container" onClickedOutsideOrEscape={onEvent} use:clickOutsideOrEscape>
    Action container
</div>
