<script lang="ts" module>
    import type { ProjectSettingDescriptor } from "$lib/model/project-setting";

    /**
     * The number of reviews a project paper needs before it receives a final decision.
     *
     * Defaults to 2 if the project does not define one.
     */
    export const numberOfReviewersSetting: ProjectSettingDescriptor<number> = {
        read: (project) => project.settings?.decisionMatrix?.numberOfReviewers ?? 2,
        toPatch: (value) => ({ settings: { decisionMatrix: { numberOfReviewers: value } } }),
        action: "updating the number of required reviewers",
    };
</script>

<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import { Slider } from "$lib/components/primitives/slider";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import { projectSetting } from "$lib/model/project-setting.svelte";
    import type { Project } from "$lib/model/api/project";

    interface Props {
        projectId: string;
        settingsLocked?: boolean;
        loadingProject: Promise<Project>;
    }

    const { projectId, settingsLocked = false, loadingProject }: Props = $props();

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    // A settings section belongs to exactly one project for as long as it is mounted, so these props
    // are read once. This mirrors the previous `onMount` behaviour.
    // svelte-ignore state_referenced_locally
    const setting = projectSetting(numberOfReviewersSetting, {
        projectId,
        loadingProject,
        settingsLocked: () => settingsLocked,
        isArchived: () => isProjectArchived,
    });
</script>

<!--
@component
This component renders a section within the Review project settings. It allows project admins to set the number of
required reviewers.
When a project papers has a number of reviews that is equal to this setting, it is considered to be fully reviewed and
receives a final decision.

The `settingsLocked` prop can be used to disable this setting.

Usage:
```svelte
    <NumberOfReviewersSettings {loadingProject} {projectId} />
```
-->
<SettingsSection
    loading={setting.loading}
    locked={setting.locked}
    lockedDescription="To ensure consistency, the number of required reviewers can't be changed after a review has been submitted."
    sectionTitle="Number of Required Reviewers"
>
    <p>
        Set the number of required reviewers per paper. When this number is reached and the final
        decision is either 'Accept' or 'Decline', the paper is considered reviewed. If the decision
        is 'Maybe' one arbitrator must make the final decision.
    </p>
    <div class="group/slider pb-10">
        <Slider
            class="max-w-2xl"
            disabled={setting.disabled}
            max={10}
            min={1}
            onValueCommit={(value) => void setting.commit(value)}
            step={1}
            thumbLabelVisibility="visible"
            tickLabels="min-max"
            type="single"
            bind:value={setting.value}
        />
    </div>
    <ActionErrorAlert error={setting.error} />
</SettingsSection>
