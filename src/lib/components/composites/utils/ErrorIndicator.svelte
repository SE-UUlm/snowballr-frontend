<script lang="ts">
    import CircleAlert from "lucide-svelte/icons/circle-alert";

    interface Props {
        errorMessage: string;
    }

    const { errorMessage }: Props = $props();
</script>

<!--
@component
Component to display an error.

Usage:
```svelte
    <ErrorIndicator errorMessage="Couldn't load data" />
```
-->
<div class="flex flex-row items-center gap-x-2 p-2">
    <CircleAlert class="text-neutral-500" size={20} />
    <span class="text-error-italic">{errorMessage}</span>
</div>
