<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import ProjectMemberListEntry from "$lib/components/composites/settings/project-settings/members/ProjectMemberListEntry.svelte";
    import ProjectMemberListEntrySkeleton from "$lib/components/composites/settings/project-settings/members/ProjectMemberListEntrySkeleton.svelte";
    import Separator from "$lib/components/primitives/separator/separator.svelte";
    import { MemberRole, Project_Member } from "$lib/model/api/project.js";
    import { resource } from "$lib/resource.svelte.js";
    import { getName, pluralize } from "$lib/utils/common-helper.js";
    import { toast } from "svelte-sonner";
    import InviteUsersDialog from "$lib/components/composites/settings/project-settings/members/InviteUsersDialog.svelte";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import { loadMembers, type MemberInfo } from "./helper";

    let { data } = $props();
    const { user, projectId, loadingProject, loadingMembers } = data;
    const numberOfSkeletons = 7;

    let loadingMembersLocal = $state<Promise<MemberInfo[]>>(loadingMembers);
    const isCurrentUserAdmin = resource<boolean, boolean>(
        loadingMembers.then(
            (members) =>
                members.find((member) => member.user!.id === user.id)?.role === MemberRole.ADMIN,
        ),
        {
            initialValue: false,
            onErrorValue: false,
            resourceName: "isCurrentUserAdmin",
        },
    );

    async function reloadMembers(errorMessage: string) {
        // First fetch the members again and only then replace them, so that no loading state is shown
        await loadMembers({ id: projectId })
            .then((members) => {
                loadingMembersLocal = Promise.resolve(members);
            })
            .catch((error) => {
                toast(errorMessage);
                console.error(`Couldn't reload members: ${error}`);
            });
    }

    async function onUsersInvited(invitedUsers: string[]) {
        // Filter out users that are already members
        const memberEmails = (await loadingMembers).map((member) => member.user?.email);
        const filteredInvitedUsers = invitedUsers.filter((user) => !memberEmails.includes(user));

        let message = "";
        if (filteredInvitedUsers.length === 0) {
            message = `${pluralize(memberEmails.length, "User is", "Users are")} already invited`;
        } else if (filteredInvitedUsers.length === 1) {
            message = `Invited ${filteredInvitedUsers[0]} to the project`;
        } else {
            message = `Invited ${filteredInvitedUsers.length} users to the project`;
        }

        await reloadMembers(
            `Couldn't invite ${pluralize(filteredInvitedUsers.length, "user", "users")} to the project`,
        );
        toast(message);
    }

    async function onMemberRemoved(member: Project_Member) {
        const name = getName(member.user!);
        await reloadMembers(`Couldn't remove ${name} from project.`);
        toast(`Removed ${name} from the project`);
    }
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>Members | Settings | {project.name}</title>
    {:catch}
        <title>Members | Settings</title>
    {/await}
</svelte:head>

<ProjectSettingsLayout {projectId} selectedTab="members">
    {#if isCurrentUserAdmin.value}
        <div class="flex flex-row items-center justify-between">
            <h1>Manage Access</h1>
            <InviteUsersDialog
                loadingMembers={loadingMembersLocal}
                {onUsersInvited}
                {projectId}
                {user}
            />
        </div>
    {:else}
        <h1>Members</h1>
    {/if}
    <ul class="flex h-fit w-full flex-col gap-3 rounded-md border py-2.5">
        {#await loadingMembersLocal}
            {#each { length: numberOfSkeletons }, i}
                <ProjectMemberListEntrySkeleton />
                {#if i < numberOfSkeletons - 1}
                    <Separator />
                {/if}
            {/each}
        {:then members}
            {#each members as member, i (member.user!.id)}
                <ProjectMemberListEntry
                    isAdminView={isCurrentUserAdmin.value}
                    isCurrentUser={member.user!.id === user.id}
                    isInvitationPending={member.isInvitationPending}
                    {member}
                    {onMemberRemoved}
                    {projectId}
                />
                {#if i < members.length - 1}
                    <Separator />
                {/if}
            {/each}
            {#if members.length === 0}
                <li class="m-auto py-1">
                    <span class="text-hint">No members found</span>
                </li>
            {/if}
        {:catch error}
            {console.error(`Couldn't load project members: ${error}`)}
            <li class="m-auto py-4">
                <ErrorIndicator errorMessage="Couldn't load project members" />
            </li>
        {/await}
    </ul>
</ProjectSettingsLayout>
