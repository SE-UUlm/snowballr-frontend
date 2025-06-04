<script lang="ts">
    import { type Project_Member } from "$lib/model/api/project";
    import { getName } from "$lib/utils/common-helper";
    import type { MemberInfo } from "../../../../../../routes/project/[projectId]/settings/helper";
    import PromoteMemberDialog from "./PromoteMemberDialog.svelte";
    import RemoveMemberDialog from "./RemoveMemberDialog.svelte";

    interface Props {
        projectId: string;
        member: MemberInfo;
        isCurrentUser: boolean;
        isAdminView: boolean;
        onMemberRemoved?: (member: Project_Member) => void;
        onMemberPromoted?: (member: Project_Member) => void;
        disabled?: boolean;
    }

    let {
        projectId,
        member,
        isCurrentUser,
        isAdminView,
        onMemberRemoved = undefined,
        onMemberPromoted = undefined,
        disabled = false,
    }: Props = $props();
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
                {isAdminView}
                isCurrentUser={member.user!.id === currentUser.id}
                {member}
                {onMemberPromoted}
                {onMemberRemoved}
                {projectId}
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
        {#if member.isInvitationPending}
            <span class="text-hint">Invitation Pending ...</span>
        {/if}
        <PromoteMemberDialog
            {disabled}
            {isAdminView}
            {isCurrentUser}
            {member}
            {onMemberPromoted}
            {projectId}
        />
        {#if isAdminView}
            <RemoveMemberDialog {disabled} {isCurrentUser} {member} {onMemberRemoved} {projectId} />
        {/if}
    </div>
</li>
