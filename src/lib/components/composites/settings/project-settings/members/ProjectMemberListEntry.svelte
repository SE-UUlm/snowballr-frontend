<script lang="ts">
    import Button from "$lib/components/primitives/button/button.svelte";
    import { MemberRole, type Project_Member } from "$lib/model/api/project";
    import { getName } from "$lib/utils/common-helper";
    import { cn } from "$lib/utils/shadcn-helper";
    import Trash from "lucide-svelte/icons/trash";

    interface Props {
        member: Project_Member;
        isCurrentUser: boolean;
        isInvitationPending: boolean;
        isAdminView: boolean;
    }

    let { member, isCurrentUser, isInvitationPending, isAdminView }: Props = $props();
    const role = member.role === MemberRole.ADMIN ? "Admin" : "Member";
    const isRoleReadonly = isCurrentUser || !isAdminView;
</script>

<!--
@component
List entry representing a project member, displaying there name and email.

Actions:
- promote the member to an admin
- remove the member from the project

Usage:
```svelte
    <ul>
        {#each members as member}
            <ProjectMemberListEntry
                isAdminView={isCurrentUserAdmin}
                isCurrentUser={member.user!.id === user.id}
                isInvitationPending={false}
                {member}
            />
        {/each}
    </ul>
```
-->
<li class="flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
    <div class="flex flex-col">
        <h3>
            {getName(member.user!)}
            {#if isCurrentUser}
                <span class="text-gray-400"> - You</span>
            {/if}
        </h3>
        <span class="text-hint text-primary">{member.user!.email}</span>
    </div>
    <div class="flex flex-row items-center gap-2.5">
        {#if isInvitationPending}
            <span class="text-hint">Invitation Pending ...</span>
        {/if}
        <Button
            class={cn(
                "w-[7.7rem]",
                isRoleReadonly
                    ? "hover:cursor-default hover:bg-transparent"
                    : "border border-gray-300 bg-gray-100 hover:bg-gray-200",
            )}
            variant={isRoleReadonly ? "ghost" : "secondary"}
        >
            <!-- Take maximum space so that text is left aligned -->
            <span class="flex w-full">Role: {role}</span>
        </Button>
        {#if isAdminView}
            <Button
                class="size-10 border border-gray-300 bg-gray-100 hover:bg-gray-200"
                disabled={isCurrentUser}
            >
                <Trash class="!size-6 text-red-500" />
            </Button>
        {/if}
    </div>
</li>
