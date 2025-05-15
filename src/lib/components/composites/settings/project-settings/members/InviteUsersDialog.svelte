<script lang="ts">
    import Dialog from "$lib/components/composites/dialog/Dialog.svelte";
    import Button, { buttonVariants } from "$lib/components/primitives/button/button.svelte";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    import InviteUsersInput from "$lib/components/composites/input/InviteUsersInput.svelte";
    import type { User } from "$lib/model/api/user";
    import type { Project_Member } from "$lib/model/api/project";
    import type { ApiError } from "$lib/model/general";
    import { backendService } from "$lib/grpc-api";
    import ErrorAlert from "$lib/components/composites/utils/ErrorAlert.svelte";
    import { loadUsers } from "$lib/components/composites/input/loading-users";

    interface Props {
        user: User;
        projectId: string;
        loadingMembers: Promise<Project_Member[]>;
        onUsersInvited?: (invitedUsers: string[]) => void;
    }

    let { user, projectId, loadingMembers, onUsersInvited = undefined }: Props = $props();

    let loading = $state(false);
    let error = $state<ApiError | undefined>(undefined);
    let open = $state(false);
    let membersInput: string[] = $state([]);
    let loadingUsers = $state(true);
    let isErrorOnUsersLoading = $state(false);
    let initialPossibleMembers: User[] = $state([]);
    let actionButtonDisabled = $derived(loading || membersInput.length === 0);

    $effect(() => {
        loadingMembers
            .then(async (members) => {
                const result = await loadUsers(
                    user,
                    members.map((member) => member.user!),
                );
                initialPossibleMembers = result.initialPossibleMembers;
                isErrorOnUsersLoading = result.isErrorOnUsersLoading;
                loadingUsers = false;
            })
            .catch(() => ({ initialPossibleMembers: [], isErrorOnUsersLoading: true }));
    });

    async function inviteUsers(event: Event) {
        event.preventDefault();

        error = undefined;
        loading = true;
        try {
            const members = (await loadingMembers).map((member) => member.user?.email);
            // filter out emails of existing members
            const filteredMembersInput = membersInput.filter(
                (userEmail) => !members.includes(userEmail),
            );
            await Promise.all(
                filteredMembersInput.map(
                    (userEmail) =>
                        backendService.inviteUserToProject({ projectId, userEmail }).response,
                ),
            );
            onUsersInvited?.(membersInput);
            membersInput = [];
            open = false;
        } catch (inviteUsersError) {
            error = { errorTitle: "Something went wrong while inviting the users." };
            console.error(`Couldn't invite users: ${inviteUsersError}`);
        }
        loading = false;
    }
</script>

<!--
@component
`Dialog` that lets the user type email addresses and user names that should be invited to the project.

- `loadingMembers` resolved to the already existing members of the project.
- `onUsersInvited` is called when the submit button of the dialog is pressed.
    The passed argument contains the email addresses of all users that should be invited

Usage:
```svelte
    <InviteUsersDialog
        {loadingMembers}
        onUsersInvited={(users) => console.log(`Inviting users: ${users}`)}
        {projectId}
        {user}
    />
```
-->
<Dialog
    title="Invite Users"
    triggerProps={{ class: buttonVariants({ variant: "default" }), disabled: loadingUsers }}
    bind:open
>
    {#snippet trigger()}
        Invite Users
    {/snippet}
    {#snippet description()}
        Search for an existing user or invite a new user by email.
    {/snippet}
    {#snippet content()}
        <form id="invite-users" onsubmit={inviteUsers}>
            <InviteUsersInput {initialPossibleMembers} {isErrorOnUsersLoading} bind:membersInput />
        </form>
        {#if error}
            <ErrorAlert errorTitle={error.errorTitle} />
        {/if}
    {/snippet}
    {#snippet footer()}
        <Button
            class="w-32"
            data-testid="invite-users-button"
            disabled={actionButtonDisabled}
            form="invite-users"
            type="submit"
        >
            {#if loading}
                <LoaderCircle class="animate-spin" />
                Sending Invitations
            {:else}
                Send Invitations
            {/if}
        </Button>
    {/snippet}
</Dialog>
