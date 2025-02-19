<script lang="ts">
    import Select, { type SelectOption } from "$lib/components/composites/select/Select.svelte";
    import type { User } from "$lib/model/api/user";
    import { getName } from "$lib/utils/common-helper";

    interface Props {
        loadingReviewers: Promise<User[]>;
        selectedReviewers?: string[];
    }

    let { loadingReviewers, selectedReviewers = $bindable(undefined) }: Props = $props();

    let reviewers = $state<User[] | undefined>(undefined);
    let options = $derived<SelectOption[]>(
        reviewers?.map((reviewer) => {
            return {
                value: `${reviewer.id}`,
                label: getName(reviewer),
            };
        }) ?? [],
    );

    loadingReviewers
        .then((loadedReviewers) => {
            reviewers = loadedReviewers;
        })
        .catch((error) => {
            console.error(`Failed to load reviewers: ${error}`);
        });
</script>

<Select categoryLabel="Reviewers" {options} bind:selectedValues={selectedReviewers} />
