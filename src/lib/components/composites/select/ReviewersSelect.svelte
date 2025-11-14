<script lang="ts">
    import MultiSelect, {
        type SelectOption,
    } from "$lib/components/composites/select/MultiSelect.svelte";
    import type { User } from "$lib/model/api/user";
    import { resource } from "$lib/resource.svelte";
    import { getName } from "$lib/utils/common-helper";

    interface Props {
        loadingReviewers: Promise<User[]>;
        selectedReviewers?: string[];
    }

    let { loadingReviewers, selectedReviewers = $bindable(undefined) }: Props = $props();

    const reviewers = resource<User[], User[]>(loadingReviewers, {
        initialValue: [],
        resourceName: "reviewers",
    });

    let options = $derived<SelectOption[]>(
        reviewers.value.map((reviewer) => {
            return {
                value: `${reviewer.id}`,
                label: getName(reviewer),
            };
        }),
    );
</script>

<MultiSelect categoryLabel="Reviewers" {options} bind:selectedValues={selectedReviewers} />
