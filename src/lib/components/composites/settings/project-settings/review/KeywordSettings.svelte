<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import { onMount } from "svelte";
    import ChipsInput from "$lib/components/composites/input/ChipsInput.svelte";
    import type { ValidationResult } from "$lib/model/general";

    interface Props {
        projectId: string;
    }

    const maximumNumberOfTags = 50;
    const maximumTagLength = 100;

    export function getProjectKeywordsKey(projectId: string): string | null {
        return localStorage.getItem(`project_${projectId}_keywords`);
    }

    const { projectId }: Props = $props();

    let tags: string[] = $state([]);

    /**
     * Loads the already defined keyword tags for the selected project.
     */
    onMount(async () => {
        const projectKeywords = getProjectKeywordsKey(projectId);
        if (projectKeywords) {
            tags = JSON.parse(projectKeywords);
        }
    });

    /**
     * Validates the input for a tag. If the input is incorrect, the tag is not created.
     * If a new tag input is registered, it is checked whether it is not empty, it does not exceed
     * the maximal tag length, the maximal number of tags is not reached or the tag name already
     * exists. In this case the tag is correct and is added to the tag input field.
     * @param newTag - validates the newly created tag
     * @returns - the validation result of the new tag
     */
    function validateTags(newTag: string): ValidationResult {
        let validationResult: ValidationResult = { success: true };
        if (tags && tags.length > 0) {
            if (newTag.trim().length == 0) {
                validationResult = { success: false, error: "Empty keywords are not allowed!" };
            } else if (newTag.trim().length > maximumTagLength) {
                validationResult = {
                    success: false,
                    error: `Maximum keyword length of ${maximumTagLength} characters exceeded!`,
                };
            } else if (tags.length > maximumNumberOfTags) {
                validationResult = { success: false, error: `Maximum number of keywords reached!` };
            } else if (
                Array.from(tags)
                    .slice(0, tags.length - 1)
                    .includes(newTag)
            ) {
                validationResult = { success: false, error: `Keyword name already exists!` };
            }
        }
        return validationResult;
    }

    $effect(() => {
        localStorage.setItem(`project_${projectId}_keywords`, JSON.stringify(tags));
    });
</script>

<!--
@component
Component for adding tags. The component includes a text input field to enter the name of the tags.
On pressing the enter button a tag gets created. Each tag has a button to remove the tag, this
button appears if the user hovers over the tag. Both, the maximal amount of tags and the maximal
length of a single tag are customizable.

Usage:
```svelte
    <KeywordSettings {maximumAmountOfTags} {maximalTagLength} />
```
-->
<SettingsSection sectionTitle="Keywords">
    <div class="max-w-2xl">
        <ChipsInput
            label="Define keywords that are highlighted in the abstract of a paper in the review mode."
            placeholder="Add keyword"
            validate={(newTag) => validateTags(newTag)}
            bind:items={tags}
        />
    </div>
</SettingsSection>
