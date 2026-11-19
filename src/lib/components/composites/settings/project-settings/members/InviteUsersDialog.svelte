<script lang="ts">
    import Dialog from "$lib/components/composites/dialog/Dialog.svelte";
    import { buttonVariants } from "$lib/components/primitives/button/button.svelte";
    import InviteUsersInput from "$lib/components/composites/input/InviteUsersInput.svelte";
    import type { Project_Member } from "$lib/api/types";
    import { inviteUserToProject } from "$lib/api/invitation";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { loadingWrapper } from "$lib/utils/common-helper";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import { SvelteSet } from "svelte/reactivity";

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
    // The emails already invited since the dialog was opened, so a retry only sends the failed ones
    const invitedEmails = new SvelteSet<string>();

    async function inviteUsers(event: Event) {
        event.preventDefault();

        inviteUsersError = undefined;
        try {
            const members = (await loadingMembers).map((member) => member.user?.email);
            // Leave out existing members and the users an earlier attempt already invited
            const pendingInvitees = invitees.filter(
                (userEmail) => !members.includes(userEmail) && !invitedEmails.has(userEmail),
            );
            const unreportedInvitees = invitees.filter(
                (userEmail) => !invitedEmails.has(userEmail),
            );
            const results = await Promise.allSettled(
                pendingInvitees.map(async (userEmail) => {
                    await inviteUserToProject(projectId, userEmail);
                    invitedEmails.add(userEmail);
                }),
            );
            const failure = results.find((result) => result.status === "rejected");
            if (failure !== undefined) {
                const newlyInvited = pendingInvitees.filter((userEmail) =>
                    invitedEmails.has(userEmail),
                );
                if (newlyInvited.length > 0) {
                    onUsersInvited?.(newlyInvited);
                }
                throw failure.reason;
            }
            onUsersInvited?.(unreportedInvitees);

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
            invitedEmails.clear();
        }
    });
</script>

<!--
@component
A dialog that lets the user type email addresses and user names that should be invited to the project,
similar to the {@link CreateProjectDialog}.

- `loadingMembers` resolve to the already existing members or invitees of the project.
- `onUsersInvited` is called after users were invited. It gets the email addresses entered since
    the last call. If only some invitations failed, it gets the ones that succeeded, and a retry
    only sends the failed invitations again.

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
