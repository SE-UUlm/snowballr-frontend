<script lang="ts">
    import { buttonVariants } from "$lib/components/primitives/button/button.svelte";
    import { getName } from "$lib/utils/common-helper";
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import Trash from "lucide-svelte/icons/trash";
    import { MemberRole, type Project_Member } from "$lib/model/api/project";
    import { backendService } from "$lib/grpc-api";

    interface Props {
        projectId: string;
        member: Project_Member;
        isCurrentUser: boolean;
        onMemberRemoved?: (member: Project_Member) => void;
    }

    let { projectId, member, isCurrentUser, onMemberRemoved = undefined }: Props = $props();

    const memberName = getName(member.user!);
    // Make isDisabled reactive
    // When we update the members list in the members settings page, this wouldn't get updated otherwise
    let isDisabled = $derived(isCurrentUser || member.role === MemberRole.ADMIN);
    let loading = $state(false);
    let error = $state<unknown>(undefined);
    let open = $state(false);

    async function removeMember() {
        error = undefined;
        loading = true;
        await backendService
            .removeProjectMember({
                projectId,
                userId: member.user!.id,
            })
            .response.then(() => {
                onMemberRemoved?.(member);
                open = false;
            })
            .catch((removeMemberError) => {
                error = removeMemberError;
                console.error(`Couldn't remove member: ${removeMemberError}`);
            });
        loading = false;
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
    actionButtonText={`Remove ${memberName} From This Project`}
    actionProps={{
        variant: "destructive-subtle",
        onclick: removeMember,
    }}
    errorText="Couldn't remove member"
    title={`Remove ${memberName} From This Project`}
    triggerProps={{
        disabled: isDisabled,
        class: buttonVariants({ variant: "destructive-subtle", size: "icon" }),
        "aria-label": `Remove member ${member.user!.email}`,
    }}
    bind:loading
    bind:error
    bind:open
>
    {#snippet trigger()}
        <Trash class="size-6!" />
    {/snippet}
    {#snippet description()}
        Once removed, <span class="font-bold">{memberName}</span> will no longer have access to this
        project. You can always re-invite them later.
    {/snippet}
</AlertDialog>
