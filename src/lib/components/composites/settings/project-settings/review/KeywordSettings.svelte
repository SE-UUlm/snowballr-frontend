<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import TagsInput from "svelte-unstyled-tags";
    import { toast } from "svelte-sonner";

    interface Props {
        maximumAmountOfTags: number;
        maximalTagLength: number;
    }

    const { maximumAmountOfTags = 25, maximalTagLength = 15 }: Props = $props();

    let tags: string[] = $state([]);

    /**
     * Validates the input for a tag. If the input is incorrect, the tag is not created.
     * If a new tag input is registered, it is checked whether it is not empty, it does not exceed
     * the maximal tag length, the maximal number of tags is not reached or the tag name already
     * exists. In this case the tag is correct and is added to the tag input field.
     */
    function validateTags() {
        if (tags && tags.length > 0) {
            const newTag = tags[tags.length - 1];
            if (newTag.trim().length == 0) {
                tags.pop();
                return toast("Empty keywords are not allowed!");
            } else if (newTag.trim().length > maximalTagLength) {
                tags.pop();
                return toast(`Maximal keyword length of ${maximalTagLength} characters exceeded!`);
            } else if (tags.length > maximumAmountOfTags) {
                tags.pop();
                return toast(`Maximal amount of keywords reached!`);
            } else if (Array.from(tags).slice(0, tags.length - 1).includes(newTag)) {
                tags.pop();
                return toast(`Keyword name already exists!`);
            }
            return tags;
        }
    }


</script>

<!--
@component
Component for adding tags. The component includes a text input field to enter the name of the tags.
On pressing the enter button a tag gets created. Each tag has a button to remove the tag, this
button appears if the user hovers over the tag. Both, the maximal amount of tags and the maximal
length of a single tag are customizable.

Usage:
```svelte
    <SettingsSection {maximumAmountOfTags} {maximalTagLength} />
-->
<SettingsSection sectionTitle="Keywords">
    <div class="items-top space-x-2">
        <div class="grid max-w-2xl gap-1.5 pt-1 leading-none">
            <TagsInput
                allTagsWrapperClasses="flex flex-row items-center gap-x-2 gap-y-2 flex-wrap"
                inputClasses="focus:outline-none focus:ring-0 pl-2 py-1"
                labelText="Define keywords that are highlighted in the abstract of a paper in the review mode."
                removeTagButtonClasses="hidden group-hover:inline-block ml-2 text-black-500 hover:text-black-500 cursor-pointer"
                showLabel={true}
                tagWrapperClasses="group flex items-start bg-gray-200 text-black px-2 py-1.5 rounded-xl"
                tagsInputWrapperClasses="flex items-start border-2 border-gray-200 py-2 px-3 rounded-md mt-2 h-[84px] overflow-auto"
                bind:tags
                on:input={() => validateTags()}
            />
        </div>
    </div>
</SettingsSection>
