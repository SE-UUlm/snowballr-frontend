<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import { Slider } from "$lib/components/primitives/slider";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import { backendService } from "$lib/grpc-api";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import { Project, Project_Settings } from "$api/project";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";

    interface Props {
        projectId: string;
        slrSettingsLocked?: boolean;
        loadingProject: Promise<Project>;
    }

    const { projectId, slrSettingsLocked = false, loadingProject }: Props = $props();

    let value = $state(-1);
    let storedValue = $state(-1);
    let loading = $state(true);
    let updateSLRSettingsError: ActionError = $state(undefined);

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    const locked = $derived(slrSettingsLocked || isProjectArchived);
    const disabled = $derived(locked || loading);

    onMount(async () => {
        await loadingProject
            .then((project) => {
                value = project.settings?.similarityThreshold ?? 0.5;
                storedValue = value;
            })
            .catch((error) => {
                updateSLRSettingsError = createActionError(
                    "Failed to Load Project Settings",
                    { action: "loading the project settings" },
                    error,
                );
            })
            .finally(() => {
                loading = false;
            });
    });

    async function onValueChanged(newValue: number) {
        if (newValue === storedValue) return;

        loading = true;
        const projectData: Partial<Project> = {
            id: projectId,
            settings: Project_Settings.create({
                similarityThreshold: newValue,
            }),
        };

        await backendService
            .updateProject({
                project: Project.create(projectData),
                mask: { paths: ["project.settings.similarity_threshold"] },
            })
            .response.then(() => {
                storedValue = newValue;
                toast.success("Successfully updated the project settings.");
            })
            .catch((error) => {
                updateSLRSettingsError = createActionError(
                    "Failed to Update Project Settings",
                    { action: "updating the similarity threshold" },
                    error,
                );
                value = storedValue;
            })
            .finally(() => {
                loading = false;
            });
    }
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
    {loading}
    {locked}
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
            {disabled}
            max={1}
            min={0.2}
            onValueCommit={onValueChanged}
            step={0.05}
            thumbLabelVisibility="visible"
            tickLabels="min-max"
            type="single"
            bind:value
        />
    </div>
    <ActionErrorAlert error={updateSLRSettingsError} />
</SettingsSection>
