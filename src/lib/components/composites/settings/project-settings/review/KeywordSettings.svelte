<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import { onMount } from "svelte";
    import ChipsInput from "$lib/components/composites/input/ChipsInput.svelte";
    import type { ValidationResult } from "$lib/model/general";

    interface Props {
        projectId: string;
    }

    const MAX_NUMBER_OF_TAGS = 50;
    const MAX_TAG_LENGTH = 100;

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
    function validateTag(newTag: string): ValidationResult {
        if (tags.length >= MAX_NUMBER_OF_TAGS) {
            return { success: false, error: `Maximum number of keywords reached!` };
        }
        const newTagLength = newTag.trim().length;
        if (newTagLength === 0) {
            return { success: false, error: "Blank keywords are not allowed!" };
        }
        if (newTagLength > MAX_TAG_LENGTH) {
            return {
                success: false,
                error: `Maximum keyword length of ${MAX_TAG_LENGTH} characters exceeded!`,
            };
        }
        if (tags.includes(newTag)) {
            return { success: false, error: `Keyword name already exists!` };
        }
        return { success: true };
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
    <KeywordSettings {projectId} />
```
-->
<SettingsSection sectionTitle="Keywords">
    <div class="max-w-2xl">
        <ChipsInput
            label="Define keywords that are highlighted in the abstract of a paper when the review mode is activated."
            placeholder="Add keyword"
            validate={(newTag) => validateTag(newTag)}
            bind:items={tags}
        />
    </div>
</SettingsSection>
