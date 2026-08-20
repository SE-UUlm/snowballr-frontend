<script lang="ts" module>
    import type { ProjectSettingDescriptor } from "$lib/model/project-setting";

    /**
     * The similarity threshold above which two papers are considered to be the same paper.
     *
     * Defaults to 0.5 if the project does not define one.
     */
    export const similarityThresholdSetting: ProjectSettingDescriptor<number> = {
        read: (project) => project.settings?.similarityThreshold ?? 0.5,
        toPatch: (value) => ({ settings: { similarityThreshold: value } }),
        action: "updating the similarity threshold",
    };
</script>

<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import { Slider } from "$lib/components/primitives/slider";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import { projectSetting } from "$lib/model/project-setting.svelte";
    import type { Project } from "$api/project";

    interface Props {
        projectId: string;
        slrSettingsLocked?: boolean;
        loadingProject: Promise<Project>;
    }

    const { projectId, slrSettingsLocked = false, loadingProject }: Props = $props();

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    // A settings section belongs to exactly one project for as long as it is mounted, so these props
    // are read once.
    // svelte-ignore state_referenced_locally
    const setting = projectSetting(similarityThresholdSetting, {
        projectId,
        loadingProject,
        settingsLocked: () => slrSettingsLocked,
        isArchived: () => isProjectArchived,
    });
</script>

<!--
@component
This component renders a section within the SLR project settings. It allows project admins to set the
similarity threshold that is used to determine whether two papers are considered equal.
A higher threshold requires papers to be more similar to be treated as duplicates.

The `slrSettingsLocked` prop can be used to disable this setting if the SLR settings are locked.

Usage:
```svelte
    <SimilarityThresholdSetting {loadingProject} {projectId} {slrSettingsLocked} />
```
-->
<SettingsSection
    loading={setting.loading}
    locked={setting.locked}
    lockedDescription="To ensure consistency, the similarity threshold can't be changed after a review has been submitted."
    sectionTitle="Similarity Threshold"
>
    <p>
        Set the similarity threshold used to consider two papers as equal. A higher threshold
        requires papers to be more similar before they are treated as duplicates.
    </p>
    <p class="text-description">
        Note: Setting a low similarity threshold may cause two unique papers to be considered equal.
    </p>
    <div class="group/slider pb-10">
        <Slider
            class="max-w-2xl"
            disabled={setting.disabled}
            max={1}
            min={0.2}
            onValueCommit={(value) => void setting.commit(value)}
            step={0.05}
            thumbLabelVisibility="visible"
            tickLabels="min-max"
            type="single"
            bind:value={setting.value}
        />
    </div>
    <ActionErrorAlert error={setting.error} />
</SettingsSection>
