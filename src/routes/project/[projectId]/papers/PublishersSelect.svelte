<script lang="ts">
    import Select from "$lib/components/composites/select/Select.svelte";
    import type { SelectOption } from "$lib/components/composites/select/types";

    interface Props {
        loadingPublishers: Promise<string[]>;
    }

    const { loadingPublishers }: Props = $props();

    let publishers = $state<string[] | undefined>(undefined);
    let options = $derived<SelectOption[]>(
        publishers?.map((publisher) => {
            return {
                value: publisher,
                label: publisher,
            };
        }) ?? [],
    );

    loadingPublishers
        .then((loadedPublishers) => {
            publishers = loadedPublishers;
        })
        .catch((error) => {
            console.error(`Failed to load publishers: ${error}`);
        });
</script>

<Select {options} categoryLabel="Publishers" />
