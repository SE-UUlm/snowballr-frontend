<script lang="ts" module>
    import type { ProjectSettingDescriptor } from "$lib/model/project-setting";

    /**
     * Whether reviewers may pick 'Maybe' as a decision, next to 'Accept' and 'Decline'.
     *
     * Defaults to `false` if the project does not define it.
     */
    export const maybeAsDecisionSetting: ProjectSettingDescriptor<boolean> = {
        read: (project) => project.settings?.reviewMaybeAllowed ?? false,
        toPatch: (value) => ({ settings: { reviewMaybeAllowed: value } }),
        action: "updating the project settings",
    };
</script>

<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import { Label } from "$lib/components/primitives/label";
    import { Switch } from "$lib/components/primitives/switch";
    import { maybeAsDecision } from "$lib/global-state/maybe-as-decision-state.svelte";
    import type { Project } from "$api/project";
    import { onMount } from "svelte";
    import type { ActionError } from "$lib/model/action-error";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import { commitProjectSetting, loadProjectSetting } from "$lib/model/project-setting";

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
    let pendingActionConfirmCallback: (() => Promise<void>) | null = $state(null);

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());

    // Unlike the other project settings, this one only changes after the backend confirms and is
    // gated by a confirmation dialog, so it uses the project setting core directly instead of the
    // optimistic `projectSetting()` state.
    const locked = $derived(slrSettingsLocked || isProjectArchived);
    const disabled = $derived(locked || loading);

    let updateSLRSettingsError: ActionError = $state(undefined);

    /**
     * Toggles the 'reviewMaybeAllowed' setting in the project settings.
     * This function updates the project settings to enable or disable the 'Maybe' as decision option.
     *
     * @param targetCheckedState - The desired state to set for the 'Maybe' as decision setting.
     */
    async function toggleIsMaybeAsDecisionSettingStatus(targetCheckedState: boolean) {
        loading = true;

        const error = await commitProjectSetting(
            maybeAsDecisionSetting,
            targetCheckedState,
            projectId,
        );

        if (error === undefined) {
            maybeAsDecision.isActivated = targetCheckedState;
        } else {
            updateSLRSettingsError = error;
        }

        loading = false;
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

        pendingActionConfirmCallback = () =>
            toggleIsMaybeAsDecisionSettingStatus(targetCheckedState);

        isConfirmDialogOpen = true;
    }

    async function handleActionClick() {
        const confirmedAction = pendingActionConfirmCallback;
        pendingActionConfirmCallback = null;

        await confirmedAction?.();

        // `AlertDialog` leaves `open` to the consumer, so the dialog has to be closed here. This
        // also happens when the update fails, because the error alert is rendered in the settings
        // section, which sits behind the dialog's overlay while it is open.
        isConfirmDialogOpen = false;
    }

    function handleCancelClick() {
        pendingActionConfirmCallback = null;
    }

    onMount(async () => {
        const result = await loadProjectSetting(maybeAsDecisionSetting, loadingProject);

        if (result.loaded) {
            maybeAsDecision.isActivated = result.value;
        } else {
            updateSLRSettingsError = result.error;
            maybeAsDecision.isActivated = false;
        }

        loading = false;
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
<SettingsSection {loading} {locked} sectionTitle="Maybe as Decision">
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
