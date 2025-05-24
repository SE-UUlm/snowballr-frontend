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
    let isChecked = $derived(maybeAsDecision.isActivated);

    let isConfirmDialogOpen = $state(false);
    let title = $state("");
    let dialogDescription = $state("");
    let pendingActionConfirmCallback: (() => void) | null = $state(null);

    const disabled = $derived(slrSettingsLocked || isUpdatingMaybeAsDecisionSettingStatus);

    let updateSLRSettingsError: ApiError | undefined = $state(undefined);

    async function toggleIsMaybeAsDecisionSettingStatus() {
        isUpdatingMaybeAsDecisionSettingStatus = true;

        await loadingProject
            .then((project) => {
                const projectSettings = project.settings ?? Project_Settings.create();
                projectSettings.reviewMaybeAllowed = isChecked;
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
                        maybeAsDecision.isActivated = isChecked;
                        toast.success("Successfully updated project settings.");
                    })
                    .catch((error) => {
                        isChecked = !isChecked; // Revert the switch state on error
                        console.error("Error updating project settings:", error);
                        updateSLRSettingsError = {
                            errorTitle: "Failed to update project settings",
                        };
                    })
                    .finally(() => {
                        isUpdatingMaybeAsDecisionSettingStatus = false;
                    });
            })
            .catch((error) => {
                console.error("Error fetching project settings:", error);
                toast.error("Failed to fetch project settings.");
                isUpdatingMaybeAsDecisionSettingStatus = false;
            });
    }

    function handleSwitchClick(event: MouseEvent) {
        event.preventDefault();
        updateSLRSettingsError = undefined;

        if (isUpdatingMaybeAsDecisionSettingStatus) {
            return;
        }

        const targetCheckedState = !isChecked;

        if (targetCheckedState) {
            title = "Enable 'Maybe' as Decision?";
            dialogDescription = "Are you sure you want to enable 'Maybe' as decision?";
        } else {
            title = "Disable 'Maybe' as Decision?";
            dialogDescription = "Are you sure you want to disable 'Maybe' as decision?";
        }

        pendingActionConfirmCallback = () => {
            isChecked = targetCheckedState;
            toggleIsMaybeAsDecisionSettingStatus();
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

    onMount(() => {
        async function checkInitialMaybeAsDecisionSettingStatus(id: string) {
            return await backendService
                .getProjectById({ id })
                .response.then((response) => {
                    maybeAsDecision.isActivated = response.settings?.reviewMaybeAllowed ?? true;
                    return maybeAsDecision.isActivated;
                })
                .catch((error) => {
                    console.error("Error fetching project settings:", error);
                    updateSLRSettingsError = {
                        errorTitle: "Failed to update project settings",
                    };
                    return true; // Default to true if there's an error
                });
        }

        checkInitialMaybeAsDecisionSettingStatus(projectId).then((status) => {
            isChecked = status;
            isUpdatingMaybeAsDecisionSettingStatus = false;
        });
    });
</script>

<!--
@component
This component renders a section within the SLR project settings. It allows administrators to toggle this setting for the project.
When enabled, reviewers can gain the ability to select 'Maybe' as a decision on a paper, in addition to the standard options. If disabled, the 'Maybe' option will be removed from the decision options.
Before the setting is changed, a confirmation dialog is presented to the admin, requiring them to confirm their choice to either enable or disable the 'Maybe as Decision' functionality.

Usage:
```svelte
  <MaybeAsDecisionSetting {projectId} {loadingProject} />
```
-->
<SettingsSection sectionTitle="Maybe as Decision">
    <div class="items-top flex flex-row space-x-2">
        <Switch
            id="maybe-decision-switch"
            checked={isChecked}
            onclick={handleSwitchClick}
            {disabled}
        />
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
        bind:open={isConfirmDialogOpen}
        {title}
        cancelButtonText="Cancel"
        actionButtonText="Confirm"
        actionProps={{
            onclick: handleActionClick,
        }}
        cancelProps={{
            onclick: handleCancelClick,
        }}
    >
        {#snippet description()}
            {dialogDescription}
        {/snippet}
    </AlertDialog>
</SettingsSection>
