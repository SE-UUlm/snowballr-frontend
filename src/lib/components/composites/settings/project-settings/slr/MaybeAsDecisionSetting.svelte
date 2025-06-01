<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import Alert from "$lib/components/composites/utils/Alert.svelte";
    import { Label } from "$lib/components/primitives/label";
    import { Switch } from "$lib/components/primitives/switch";
    import { maybeAsDecision } from "$lib/global-state/maybe-as-decision-state.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Project_Settings, type Project } from "$lib/model/api/project";
    import type { ApiError } from "$lib/model/general";
    import { generateFieldMask } from "protobuf-fieldmask";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";

    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
        slrSettingsLocked?: boolean;
    }

    const { projectId, loadingProject, slrSettingsLocked = false }: Props = $props();

    // `isUpdatingMaybeAsDecisionSettingStatus` is initially set to `true` to disable the switch
    let isUpdatingMaybeAsDecisionSettingStatus = $state(true);
    let checked = $derived(maybeAsDecision.isActivated);

    let isConfirmDialogOpen = $state(false);
    let title = $state("");
    let dialogDescription = $state("");
    let pendingActionConfirmCallback: (() => void) | null = $state(null);

    const disabled = $derived(slrSettingsLocked || isUpdatingMaybeAsDecisionSettingStatus);

    let updateSLRSettingsError: ApiError | undefined = $state(undefined);

    /**
     * Toggles the 'reviewMaybeAllowed' setting in the project settings.
     * This function updates the project settings to enable or disable the 'Maybe' as decision option.
     *
     * @param targetCheckedState - The desired state to set for the 'Maybe' as decision setting.
     */
    async function toggleIsMaybeAsDecisionSettingStatus(targetCheckedState: boolean) {
        isUpdatingMaybeAsDecisionSettingStatus = true;

        await loadingProject
            .then((project) => {
                const projectSettings = project.settings ?? Project_Settings.create();
                projectSettings.reviewMaybeAllowed = targetCheckedState;
                project.settings = projectSettings;

                const maskPaths = generateFieldMask(project).filter(
                    (path) => path === "settings.reviewMaybeAllowed",
                );

                backendService
                    .updateProject({
                        project,
                        mask: {
                            paths: maskPaths,
                        },
                    })
                    .response.then(() => {
                        maybeAsDecision.isActivated = targetCheckedState;
                        toast.success("Successfully updated project settings.");
                    })
                    .catch((error) => {
                        console.error("Error updating project settings:", error);
                        updateSLRSettingsError = {
                            errorTitle: "Failed to update project settings",
                        };
                    });
            })
            .catch((error) => {
                console.error("Error fetching project settings:", error);
                toast.error("Failed to fetch project settings.");
            })
            .finally(() => {
                isUpdatingMaybeAsDecisionSettingStatus = false;
            });
    }

    function handleSwitchClick(event: MouseEvent) {
        event.preventDefault();
        updateSLRSettingsError = undefined;

        if (isUpdatingMaybeAsDecisionSettingStatus) {
            return;
        }

        const targetCheckedState = !checked;

        if (targetCheckedState) {
            title = "Enable 'Maybe' as Decision?";
            dialogDescription = "Are you sure you want to enable 'Maybe' as decision?";
        } else {
            title = "Disable 'Maybe' as Decision?";
            dialogDescription = "Are you sure you want to disable 'Maybe' as decision?";
        }

        pendingActionConfirmCallback = () => {
            toggleIsMaybeAsDecisionSettingStatus(targetCheckedState);
            isConfirmDialogOpen = false;
        };

        isConfirmDialogOpen = true;
    }

    function handleActionClick() {
        if (pendingActionConfirmCallback) {
            pendingActionConfirmCallback();
        }
        pendingActionConfirmCallback = null;
    }

    function handleCancelClick() {
        pendingActionConfirmCallback = null;
    }

    onMount(async () => {
        await backendService
            .getProjectById({ id: projectId })
            .response.then((response) => {
                maybeAsDecision.isActivated = response.settings?.reviewMaybeAllowed ?? false;
            })
            .catch((error) => {
                console.error("Error fetching project settings:", error);
                updateSLRSettingsError = {
                    errorTitle: "Failed to update project settings",
                };
                maybeAsDecision.isActivated = false;
            })
            .finally(() => {
                isUpdatingMaybeAsDecisionSettingStatus = false;
            });
    });
</script>

<!--
@component
This component renders a section within the SLR project settings. It allows administrators to toggle this setting for the project.
When enabled, reviewers can gain the ability to select 'Maybe' as a decision on a paper, in addition to the standard options. If disabled, the 'Maybe' option will be removed from the decision options.
Before the setting is changed, a confirmation dialog is presented to the admin, requiring them to confirm their choice to either enable or disable the 'Maybe as Decision' functionality.

The `slrSettingsLocked` prop can be used to disable the switch if the SLR settings are locked, preventing any changes to this setting.

Usage:
```svelte
  <MaybeAsDecisionSetting {projectId} {loadingProject} {slrSettingsLocked} />
```
-->
<SettingsSection sectionTitle="Maybe as Decision">
    <div class="items-top flex flex-row space-x-2">
        <Switch id="maybe-decision-switch" {checked} {disabled} onclick={handleSwitchClick} />
        <div class="grid gap-1.5 pt-1 leading-none">
            <Label
                class="text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="maybe-decision-switch"
            >
                Allow 'Maybe' as decision on a Paper.
            </Label>
            <p class="text-description">
                When turned on, a reviewer can set their decision to 'Maybe', next to 'Accept' or
                'Decline'.
            </p>
        </div>
    </div>
    {#if updateSLRSettingsError}
        <Alert title={updateSLRSettingsError.errorTitle} variant="error" />
    {/if}

    <AlertDialog
        actionButtonText="Confirm"
        actionProps={{
            onclick: handleActionClick,
        }}
        cancelButtonText="Cancel"
        cancelProps={{
            onclick: handleCancelClick,
        }}
        {title}
        bind:open={isConfirmDialogOpen}
    >
        {#snippet description()}
            {dialogDescription}
        {/snippet}
    </AlertDialog>
</SettingsSection>
