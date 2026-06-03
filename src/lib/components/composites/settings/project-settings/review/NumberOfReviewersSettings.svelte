<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import { Slider } from "$lib/components/primitives/slider";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import { backendService } from "$lib/grpc-api";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import { Project, Project_Settings, ReviewDecisionMatrix } from "$lib/model/api/project";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";

    interface Props {
        projectId: string;
        settingsLocked?: boolean;
        loadingProject: Promise<Project>;
    }

    const { projectId, settingsLocked = false, loadingProject }: Props = $props();

    let value = $state(-1);
    let storedValue = $state(-1);
    let loading = $state(true);
    let updateSLRSettingsError: ActionError = $state(undefined);

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    const locked = $derived(settingsLocked || isProjectArchived);
    const disabled = $derived(locked || loading);

    onMount(async () => {
        await loadingProject
            .then((project) => {
                value = project.settings?.decisionMatrix?.numberOfReviewers ?? 1;
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
                decisionMatrix: ReviewDecisionMatrix.create({
                    numberOfReviewers: newValue,
                }),
            }),
        };

        await backendService
            .updateProject({
                project: Project.create(projectData),
                mask: { paths: ["project.settings.decision_matrix.number_of_reviewers"] },
            })
            .response.then(() => {
                storedValue = newValue;
                toast.success("Successfully updated the project settings.");
            })
            .catch((error) => {
                updateSLRSettingsError = createActionError(
                    "Failed to Update Project Settings",
                    { action: "updating the number of required reviewers" },
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
    {loading}
    {locked}
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
            {disabled}
            max={10}
            min={1}
            onValueCommit={onValueChanged}
            step={1}
            thumbLabelVisibility="visible"
            tickLabels="min-max"
            type="single"
            bind:value
        />
    </div>
    <ActionErrorAlert error={updateSLRSettingsError} />
</SettingsSection>
