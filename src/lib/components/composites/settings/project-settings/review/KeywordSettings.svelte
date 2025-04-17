<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import { Label } from "$lib/components/primitives/label";
    import TagsInput from "svelte-unstyled-tags";
    import { toast } from "svelte-sonner";

    const maximumAmountOfTags = 25;
    const maximalTagLength = 15;
    let tags: string[] = $state([]);

    function validateTags() {
        if (tags && tags.length > 0) {
            const newTag = tags[tags.length - 1];
            if (newTag.trim().length == 0) {
                tags.pop();
                return toast("Empty tags are not allowed!")
            } else if (newTag.trim().length > maximalTagLength) {
                tags.pop();
                return toast(`Maximal tag length of ${maximalTagLength} characters exceeded!`)
            } else if (tags.length > maximumAmountOfTags) {
                tags.pop();
                return toast(`Maximal amount of tags reached!`)
            }
            return tags;
        }
    }


</script>

<SettingsSection sectionTitle="Keywords">
    <div class="items-top flex flex-row space-x-2">
        <div class="grid gap-1.5 pt-1 leading-none">
            <Label class="font-normal">
                Define keywords that are highlighted in the abstract of a paper in the review mode.
            </Label>
            <TagsInput
                allTagsWrapperClasses="flex flex-row items-center gap-x-2 gap-y-2 flex-wrap"
                componentWrapperClasses="flex flex-wrap"
                inputClasses="focus:outline-none focus:ring-0 pl-2 py-1"
                onlyUnique={true}
                removeTagButtonClasses="hidden group-hover:inline-block ml-2 text-black-500 hover:text-black-500 cursor-pointer"
                tagWrapperClasses="group flex items-start bg-gray-200 text-black px-2 py-1.5 rounded-xl"
                tagsInputWrapperClasses="flex items-start border-2 border-gray-200 py-2 px-3 rounded-md mt-2 h-[84px] overflow-auto"
                bind:tags
                on:input={() => validateTags()}
            />
        </div>
    </div>
</SettingsSection>
