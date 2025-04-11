<script lang="ts">
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import { buttonVariants } from "$lib/components/primitives/button";
    import { backendService } from "$lib/grpc-api";
    import { MemberRole, type Project_Member } from "$lib/model/api/project";
    import { getName, wrapLongWords } from "$lib/utils/common-helper";
    import { cn } from "$lib/utils/shadcn-helper";

    interface Props {
        projectId: string;
        member: Project_Member;
        isCurrentUser: boolean;
        isAdminView: boolean;
        onMemberPromoted?: (member: Project_Member) => void;
    }

    let { projectId, member, isCurrentUser, isAdminView, onMemberPromoted }: Props = $props();

    const memberName = getName(member.user!);
    let role = $derived(member.role === MemberRole.ADMIN ? "Admin" : "Member");
    let isRoleReadonly = $derived(
        isCurrentUser || member.role === MemberRole.ADMIN || !isAdminView,
    );
    let loading = $state(false);
    let error = $state<unknown>(undefined);
    let open = $state(false);

    async function promoteMember() {
        error = undefined;
        loading = true;
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
                console.error(`Failed to promote member: ${promoteMemberError}`);
            });
        loading = false;
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
    actionButtonText="Promote Member to a Project Admin"
    actionProps={{
        variant: "destructiveSubtle",
        onclick: promoteMember,
    }}
    errorText="Failed to promote member"
    title={`Promote ${memberName} to a Project Admin?`}
    triggerProps={{
        class: cn(
            "w-[7.7rem] disabled:opacity-100! select-auto",
            buttonVariants({ variant: isRoleReadonly ? "ghost" : "destructiveSubtle" }),
            isRoleReadonly ? "hover:bg-transparent hover:cursor-default" : "text-primary",
        ),
        disabled: isRoleReadonly,
        "aria-label": `Promote member ${member.user!.email}`,
    }}
    bind:loading
    bind:error
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
