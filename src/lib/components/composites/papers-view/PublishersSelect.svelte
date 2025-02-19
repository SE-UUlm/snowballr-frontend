<script lang="ts">
    import Select, { type SelectOption } from "$lib/components/composites/select/Select.svelte";

    interface Props {
        loadingPublishers: Promise<string[]>;
        selectedPublishers?: string[];
    }

    let { loadingPublishers, selectedPublishers = $bindable(undefined) }: Props = $props();

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

<Select {options} categoryLabel="Publishers" bind:selectedValues={selectedPublishers} />
