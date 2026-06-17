<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import { Label } from "$lib/components/primitives/label";
    import { Switch } from "$lib/components/primitives/switch";
    import { maybeAsDecision } from "$lib/global-state/maybe-as-decision-state.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Project_Settings, Project } from "$api/project";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";

    interface Props {
        projectId: string;
        slrSettingsLocked?: boolean;
        loadingProject: Promise<Project>;
    }

    const { projectId, slrSettingsLocked = false, loadingProject }: Props = $props();

    let loading = $state(true);
    let checked = $derived(maybeAsDecision.isActivated);

    let isConfirmDialogOpen = $state(false);
    let title = $state("");
    let dialogDescription = $state("");
    let pendingActionConfirmCallback: (() => void) | null = $state(null);

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    const disabled = $derived(slrSettingsLocked || loading || isProjectArchived);

    let updateSLRSettingsError: ActionError = $state(undefined);

    /**
     * Toggles the 'reviewMaybeAllowed' setting in the project settings.
     * This function updates the project settings to enable or disable the 'Maybe' as decision option.
     *
     * @param targetCheckedState - The desired state to set for the 'Maybe' as decision setting.
     */
    async function toggleIsMaybeAsDecisionSettingStatus(targetCheckedState: boolean) {
        loading = true;

        const projectData: Partial<Project> = {
            id: projectId,
            settings: Project_Settings.create({
                reviewMaybeAllowed: targetCheckedState,
            }),
        };

        await backendService
            .updateProject({
                project: Project.create(projectData),
                mask: { paths: ["project.settings.review_maybe_allowed"] },
            })
            .response.then(() => {
                maybeAsDecision.isActivated = targetCheckedState;
                toast.success("Successfully updated the project settings.");
            })
            .catch((error) => {
                updateSLRSettingsError = createActionError(
                    "Failed to Update Project Settings",
                    { action: "updating the project settings" },
                    error,
                );
            })
            .finally(() => {
                loading = false;
            });
    }

    function handleSwitchClick(event: MouseEvent) {
        event.preventDefault();
        updateSLRSettingsError = undefined;

        if (loading) {
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

        pendingActionConfirmCallback = async () => {
            await toggleIsMaybeAsDecisionSettingStatus(targetCheckedState);
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
        await loadingProject
            .then((response) => {
                maybeAsDecision.isActivated = response.settings?.reviewMaybeAllowed ?? false;
            })
            .catch((error) => {
                updateSLRSettingsError = createActionError(
                    "Failed to Load Project Settings",
                    { action: "loading the project settings" },
                    error,
                );

                maybeAsDecision.isActivated = false;
            })
            .finally(() => {
                loading = false;
            });
    });
</script>

<!--
@component
This component renders a section within the SLR project settings. It allows administrators to toggle this setting for
the project.
When enabled, reviewers can gain the ability to select 'Maybe' as a decision on a paper, in addition to the standard
options. If disabled, the 'Maybe' option will be removed from the decision options.
Before the setting is changed, a confirmation dialog is presented to the admin, requiring them to confirm their choice
to either enable or disable the 'Maybe as Decision' functionality.

The `slrSettingsLocked` prop can be used to disable the switch if the SLR settings are locked, preventing any changes to
this setting.

Usage:
```svelte
  <MaybeAsDecisionSetting {projectId} {slrSettingsLocked} {loadingProject} />
```
-->
<SettingsSection {loading} locked={slrSettingsLocked} sectionTitle="Maybe as Decision">
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
    <ActionErrorAlert error={updateSLRSettingsError} />
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
        bind:loading
    >
        {#snippet description()}
            {dialogDescription}
        {/snippet}
    </AlertDialog>
</SettingsSection>
