<script lang="ts">
    import { buttonVariants } from "$lib/components/primitives/button/button.svelte";
    import { getNameOrEmail, loadingWrapper, wrapLongWords } from "$lib/utils/common-helper";
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import Trash from "lucide-svelte/icons/trash";
    import { MemberRole, type Project_Member } from "$lib/model/api/project";
    import { backendService } from "$lib/grpc-api";

    interface Props {
        projectId: string;
        member: Project_Member;
        isCurrentUser: boolean;
        onMemberRemoved?: (member: Project_Member) => void;
        disabled?: boolean;
    }

    let {
        projectId,
        member,
        isCurrentUser,
        onMemberRemoved = undefined,
        disabled: disabledProp = false,
    }: Props = $props();

    const memberName = getNameOrEmail(member.user!);
    // Make isDisabled reactive
    // When we update the members list in the members settings page, this wouldn't get updated otherwise
    let disabled = $derived(isCurrentUser || member.role === MemberRole.ADMIN || disabledProp);
    const loading = $state({ value: false });
    let error = $state<unknown>(undefined);
    let open = $state(false);

    async function removeMember() {
        error = undefined;

        await backendService
            .removeProjectMember({
                projectId,
                userEmail: member.user!.email,
            })
            .response.then(() => {
                onMemberRemoved?.(member);
                open = false;
            })
            .catch((removeMemberError) => {
                error = removeMemberError;
                console.error(`Couldn't remove member: ${removeMemberError}`);
            });
    }
</script>

<!--
@component
AlertDialog to remove a project member.

Usage:
```svelte
    <RemoveMemberDialog {projectId} {member} {isCurrentUser} />
```
-->
<AlertDialog
    actionButtonLoadingText="Removing Member From This Project"
    actionButtonText="Remove Member From This Project"
    actionProps={{
        class: "w-full sm:w-76",
        variant: "destructiveSubtle",
        onclick: (args) => loadingWrapper(loading, removeMember, args),
    }}
    {error}
    errorText="Couldn't remove member"
    loading={loading.value}
    title={`Remove ${memberName} From This Project`}
    triggerProps={{
        disabled,
        class: buttonVariants({ variant: "destructiveSubtle", size: "icon" }),
        "aria-label": `Remove member ${member.user!.email}`,
    }}
    bind:open
>
    {#snippet trigger()}
        <Trash class="size-6!" />
    {/snippet}
    {#snippet description()}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        Once removed, <span class="font-bold">{@html wrapLongWords(memberName, 55)}</span> will no
        longer have access to this project. You can always re-invite them later.
        <!-- TODO: Clarify what happens with deleted users reviews -->
    {/snippet}
</AlertDialog>
