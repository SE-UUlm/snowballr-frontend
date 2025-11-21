<script lang="ts">
    import type { ActionError, ActionErrorBase } from "$lib/model/action-error";
    import Alert from "$lib/components/composites/utils/Alert.svelte";
    import type { WithElementRef } from "bits-ui";
    import type { HTMLAttributes } from "svelte/elements";

    type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
        error: ActionError;
    };

    const { error, ...restProps }: Props = $props();
</script>

<!--
@component
Standardized Alert component for ActionError objects.
-->
{#snippet alert(error: ActionErrorBase)}
    <Alert details={error.errorDetails} title={error.errorTitle} variant={error.variant} />
{/snippet}

{#if error}
    <div {...restProps}>
        {@render alert(error)}
    </div>
{/if}
