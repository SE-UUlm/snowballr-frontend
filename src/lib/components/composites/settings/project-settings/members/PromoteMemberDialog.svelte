<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import { buttonVariants } from "$lib/components/primitives/button";
    import { backendService } from "$lib/grpc-api";
    import { MemberRole, type Project_Member } from "$lib/model/api/project";
    import { getName, loadingWrapper, wrapLongWords } from "$lib/utils/common-helper";
    import { cn } from "$lib/utils/shadcn-helper";
    import type { MemberInfo } from "../../../../../../routes/project/[projectId]/settings/helper";

    interface Props {
        projectId: string;
        member: MemberInfo;
        isCurrentUser: boolean;
        isAdminView: boolean;
        onMemberPromoted?: (member: Project_Member) => void;
        disabled?: boolean;
    }

    let {
        projectId,
        member,
        isCurrentUser,
        isAdminView,
        onMemberPromoted,
        disabled = false,
    }: Props = $props();

    const memberName = $derived(getName(member.user!));
    let role = $derived(member.role === MemberRole.ADMIN ? "Admin" : "Member");
    /**
     * Member cannot be promoted if at least one of the following conditions is met:
     * - member is current signed-in user
     * - member is already an admin
     * - current sign-in user is not a project admin (non-admin view)
     * - member is invitee
     */
    let isRoleReadonly = $derived(
        isCurrentUser ||
            member.role === MemberRole.ADMIN ||
            !isAdminView ||
            member.isInvitationPending,
    );
    const loading = $state({ value: false });
    let error = $state<unknown>(undefined);
    let open = $state(false);

    async function promoteMember() {
        error = undefined;

        await backendService
            .updateProjectMemberRole({
                projectId,
                userId: member.user!.id,
                newRole: MemberRole.ADMIN,
            })
            .response.then(() => {
                onMemberPromoted?.(member);
                open = false;
            })
            .catch((promoteMemberError) => {
                error = promoteMemberError;
                console.error(`Couldn't promote member: ${promoteMemberError}`);
            });
    }
</script>

<!--
@component
AlertDialog to promote a project member to a project admin.

Usage:
```svelte
    <PromoteMemberDialog {projectId} {member} {isCurrentUser} {isAdminView} />
```
-->
<AlertDialog
    actionButtonLoadingText="Promoting Member to a Project Admin"
    actionButtonText="Promote Member to a Project Admin"
    actionProps={{
        class: "w-full sm:w-78",
        variant: "destructiveSubtle",
        onclick: (args) => loadingWrapper(loading, promoteMember, args),
    }}
    {error}
    errorText="Couldn't promote member"
    loading={loading.value}
    title={`Promote ${memberName} to a Project Admin?`}
    triggerProps={{
        class: cn(
            "w-[7.7rem] select-auto",
            buttonVariants({ variant: isRoleReadonly ? "ghost" : "destructiveSubtle" }),
            isRoleReadonly
                ? "hover:bg-transparent hover:cursor-default disabled:opacity-100!"
                : "text-primary",
        ),
        disabled: isRoleReadonly || disabled,
        "aria-label": `Promote member ${member.user!.email}`,
    }}
    bind:open
>
    {#snippet trigger()}
        <span class="flex w-full">Role: {role}</span>
    {/snippet}
    {#snippet description()}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        Once promoted, <span class="font-bold">{@html wrapLongWords(memberName, 55)}</span> will be
        able to manage the project settings and members. This includes archiving and deleting the
        project.
        <br />
        After promoting a member to an admin, you can't demote them back to a member.
    {/snippet}
</AlertDialog>
