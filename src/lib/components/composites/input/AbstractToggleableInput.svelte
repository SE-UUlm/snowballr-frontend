<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import type { WithElementRef } from "bits-ui";
    import { maxHeight } from "./abstract-max-height-action";
    import ToggleableInput from "./ToggleableInput.svelte";

    type Props = WithElementRef<HTMLInputAttributes> & {
        isEditable: boolean;
        maxHeightActionProps?: { showButtonBar: boolean; showAdditionalInfos: boolean };
    };

    let {
        isEditable = $bindable(false),
        maxHeightActionProps,
        value = $bindable(),
    }: Props = $props();
</script>

<!--
@component
Same as ToggleableInput, but configured for the abstract textarea on the paper details card.
-->
<ToggleableInput
    {isEditable}
    inputAction={maxHeight}
    inputActionProps={maxHeightActionProps}
    {value}
/>
