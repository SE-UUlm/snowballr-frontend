<script lang="ts">
    import Dialog from "$lib/components/composites/dialog/Dialog.svelte";
    import { buttonVariants } from "$lib/components/primitives/button/button.svelte";
    import InviteUsersInput from "$lib/components/composites/input/InviteUsersInput.svelte";
    import type { User } from "$lib/model/api/user";
    import type { Project_Member } from "$lib/model/api/project";
    import type { ApiError } from "$lib/model/general";
    import { backendService } from "$lib/grpc-api";
    import { loadUsers } from "$lib/components/composites/input/loading-users";
    import { getContext } from "svelte";
    import { UserContextKey, type UserContext } from "$lib/current-user/userContext";
    import Alert from "$lib/components/composites/utils/Alert.svelte";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { loadingWrapper } from "$lib/utils/common-helper";

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

    const user = getContext<UserContext>(UserContextKey)();

    const loading = $state({ value: false });
    let error = $state<ApiError | undefined>(undefined);
    let open = $state(false);
    let membersInput: string[] = $state([]);
    let loadingUsers = $state(true);
    let isErrorOnUsersLoading = $state(false);
    let initialPossibleMembers: User[] = $state([]);
    let actionButtonDisabled = $derived(loading.value || membersInput.length === 0);

    $effect(() => {
        loadingMembers
            .then(async (members) => {
                const result = await loadUsers(
                    user,
                    members.map((member) => member.user!),
                );
                initialPossibleMembers = result.initialPossibleMembers;
                isErrorOnUsersLoading = result.isErrorOnUsersLoading;
            })
            .catch(() => {
                initialPossibleMembers = [];
                isErrorOnUsersLoading = true;
            })
            .finally(() => (loadingUsers = false));
    });

    async function inviteUsers(event: Event) {
        event.preventDefault();

        error = undefined;
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
            error = {
                errorTitle: "Invitation Failed",
                errorDetails:
                    "Something went wrong while inviting the users. Please make sure your internet connection is stable, then try again.",
            };
            console.error(`Couldn't invite users: ${inviteUsersError}`);
        }
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
    />
```
-->
<Dialog
    title="Invite Users"
    triggerProps={{
        class: buttonVariants({ variant: "default" }),
        disabled: loadingUsers || disabled,
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
            <InviteUsersInput
                {initialPossibleMembers}
                {isErrorOnUsersLoading}
                bind:invitees={membersInput}
            />
        </form>
        {#if error}
            <Alert details={error.errorDetails} title={error.errorTitle} variant="error" />
        {/if}
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
