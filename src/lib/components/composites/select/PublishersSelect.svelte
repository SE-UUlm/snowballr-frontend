<script lang="ts">
    import MultiSelect from "$lib/components/composites/select/MultiSelect.svelte";
    import type { SelectOption } from "$lib/model/select-option";
    import { resource } from "$lib/resource.svelte";

    interface Props {
        loadingPublishers: Promise<string[]>;
        selectedPublishers?: string[];
    }

    let { loadingPublishers, selectedPublishers = $bindable(undefined) }: Props = $props();

    const publishers = resource<string[], string[]>(loadingPublishers, {
        initialValue: [],
        resourceName: "publishers",
    });

    let options = $derived<SelectOption[]>(
        publishers.value.map((publisher) => {
            return {
                value: publisher,
                label: publisher,
            };
        }),
    );
</script>

<MultiSelect categoryLabel="Publishers" {options} bind:selectedValues={selectedPublishers} />
