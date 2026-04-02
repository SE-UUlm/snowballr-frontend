<script lang="ts">
    import Dialog from "$lib/components/composites/dialog/Dialog.svelte";
    import { buttonVariants } from "$lib/components/primitives/button/button.svelte";
    import InviteUsersInput from "$lib/components/composites/input/InviteUsersInput.svelte";
    import type { Project_Member } from "$api/project";
    import { backendService } from "$lib/grpc-api";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { loadingWrapper } from "$lib/utils/common-helper";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";

    interface Props {
        projectId: string;
        loadingMembers: Promise<Project_Member[]>;
        onUsersInvited?: (invitedUsers: string[]) => void;
        disabled?: boolean;
    }

    let {
        projectId,
        loadingMembers,
        onUsersInvited = undefined,
        disabled = false,
    }: Props = $props();

    const loading = $state({ value: false });
    let inviteUsersError: ActionError = $state(undefined);
    let open = $state(false);
    let invitees: string[] = $state([]);
    let actionButtonDisabled = $derived(loading.value || invitees.length === 0);

    async function inviteUsers(event: Event) {
        event.preventDefault();

        inviteUsersError = undefined;
        try {
            const members = (await loadingMembers).map((member) => member.user?.email);
            // filter out emails of existing members
            const filteredInvitees = invitees.filter((userEmail) => !members.includes(userEmail));
            await Promise.all(
                filteredInvitees.map(
                    (userEmail) =>
                        backendService.inviteUserToProject({ projectId, userEmail }).response,
                ),
            );
            onUsersInvited?.(invitees);

            invitees = [];
            open = false;
        } catch (error) {
            inviteUsersError = createActionError(
                "Invitation Failed",
                {
                    action: "inviting the users",
                },
                error as Error | undefined,
            );
        }
    }

    // if dialog is closed, then reset the invitee list
    $effect(() => {
        if (!open) {
            invitees = [];
        }
    });
</script>

<!--
@component
A dialog that lets the user type email addresses and user names that should be invited to the project,
similar to the {@link CreateProjectDialog}.

- `loadingMembers` resolve to the already existing members or invitees of the project.
- `onUsersInvited` is called when the submit button of the dialog is pressed.
    The passed argument contains the email addresses of all users that should be invited

Usage:
```svelte
    <InviteUsersDialog
        {loadingMembers}
        onUsersInvited={(users) => console.log(`Inviting users: ${users}`)}
        {projectId}
    />
```
-->
<Dialog
    title="Invite Users"
    triggerProps={{
        class: buttonVariants({ variant: "default" }),
        disabled,
    }}
    bind:open
>
    {#snippet trigger()}
        Invite Users
    {/snippet}
    {#snippet description()}
        Search for an existing user or invite a new user by email.
    {/snippet}
    {#snippet content()}
        <form
            id="invite-users"
            class="overflow-x-auto"
            onsubmit={(args) => loadingWrapper(loading, inviteUsers, args)}
        >
            <InviteUsersInput {projectId} bind:invitees />
        </form>
        <ActionErrorAlert error={inviteUsersError} />
    {/snippet}
    {#snippet footer()}
        <LoadingButton
            class="w-full sm:w-46"
            data-testid="invite-users-button"
            disabled={actionButtonDisabled}
            form="invite-users"
            label="Send Invitations"
            loading={loading.value}
            loadingLabel="Sending Invitations"
            type="submit"
        />
    {/snippet}
</Dialog>
