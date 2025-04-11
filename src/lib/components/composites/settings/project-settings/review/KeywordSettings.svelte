<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import { Label } from "$lib/components/primitives/label";
    import TagsInput from "svelte-unstyled-tags";
    let tags = [];
</script>

<SettingsSection sectionTitle="Keywords">
    <div class="items-top flex flex-row space-x-2">
        <div class="grid gap-1.5 pt-1 leading-none">
            <Label class="font-normal">
                Define keywords that are highlighted in the abstract of a paper in the review mode.
                <TagsInput
                    allTagsWrapperClasses="flex flex-row items-center gap-x-2 gap-y-2 flex-wrap"
                    componentWrapperClasses="flex flex-wrap"
                    inputClasses="focus:outline-none focus:ring-0 pl-2"
                    onlyUnique={true}
                    removeTagButtonClasses="hidden group-hover:inline-block ml-2 text-black-500 hover:text-black-500 cursor-pointer"
                    tagWrapperClasses="group flex items-center bg-gray-200 text-black px-2 py-1.5 rounded-xl"
                    tagsInputWrapperClasses="flex items-center border-2 border-gray-200 py-2 px-3 rounded-md mt-2 h-[74px]"
                    bind:tags
                />
            </Label>
        </div>
    </div>
</SettingsSection>
