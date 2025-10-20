<script lang="ts">
    import { clickOutsideOrEscape } from "$lib/utils/attachments.svelte";

    const { onEvent }: { onEvent: () => void } = $props();
</script>

<div data-testid="outside-action-container">Outside action container</div>
<div {@attach clickOutsideOrEscape(onEvent)} data-testid="action-container">Action container</div>
