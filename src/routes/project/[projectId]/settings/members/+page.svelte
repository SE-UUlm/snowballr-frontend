<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import ProjectMemberListEntry from "$lib/components/composites/settings/project-settings/members/ProjectMemberListEntry.svelte";
    import ProjectMemberListEntrySkeleton from "$lib/components/composites/settings/project-settings/members/ProjectMemberListEntrySkeleton.svelte";
    import Separator from "$lib/components/primitives/separator/separator.svelte";
    import { Project_Member } from "$api/project.js";
    import { getName, getNameOrEmail, pluralize } from "$lib/utils/common-helper.js";
    import { toast } from "svelte-sonner";
    import InviteUsersDialog from "$lib/components/composites/settings/project-settings/members/InviteUsersDialog.svelte";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import { isCurrentUserProjectAdmin, loadMembers, type MemberInfo } from "../helper";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import { getUserContext } from "$lib/custom-context/user-context";
    import { getIsProjectArchivedContext } from "$lib/custom-context/is-project-archived-context";
    import ScrollArea from "$lib/components/primitives/scroll-area/scroll-area.svelte";

    let { data } = $props();
    const { projectId, loadingProject, loadingMembers } = $derived(data);

    const { isProjectArchived } = $derived(getIsProjectArchivedContext());
    const isCurrentUserAdmin = $derived(isCurrentUserProjectAdmin(loadingMembers));
    const user = $derived(getUserContext());

    const numberOfSkeletons = 7;

    let loadingMembersLocal = $derived<Promise<MemberInfo[]>>(loadingMembers);
    let reloadingMembers = $state(false);

    async function reloadMembers(errorMessage: string) {
        reloadingMembers = true;
        // First fetch the members again and only then replace them, so that no loading state is shown
        await loadMembers({ id: projectId })
            .then((members) => {
                loadingMembersLocal = Promise.resolve(members);
            })
            .catch((error) => {
                toast.error(errorMessage);
                console.error(`Couldn't reload members: ${error}`);
            });
        reloadingMembers = false;
    }

    async function onUsersInvited(invitedUsers: string[]) {
        // Filter out users that are already members
        const memberEmails = (await loadingMembersLocal).map((member) => member.user?.email);
        const filteredInvitedUsers = invitedUsers.filter((user) => !memberEmails.includes(user));

        let toastFunc;
        if (filteredInvitedUsers.length === 0) {
            toastFunc = () =>
                toast.info(`${pluralize(invitedUsers, "User is", "Users are")} already invited`);
        } else {
            // Show user name when it's only one, otherwise show number of invited users
            const messageContent = pluralize(
                filteredInvitedUsers,
                filteredInvitedUsers[0],
                `${filteredInvitedUsers.length} users`,
            );
            toastFunc = () => toast.success(`Invited ${messageContent} to the project`);
        }

        await reloadMembers(
            `Couldn't invite ${pluralize(filteredInvitedUsers, "user", "users")} to the project`,
        );
        toastFunc();
    }

    async function onMemberRemoved(member: Project_Member) {
        const name = getNameOrEmail(member.user!);
        await reloadMembers(`Couldn't remove ${name} from project.`);
        toast.success(`Removed ${name} from the project`);
    }

    async function onMemberPromoted(member: Project_Member) {
        const name = getName(member.user!);
        await reloadMembers(`Couldn't promote ${name} to an Admin`);
        toast.success(`Promoted ${name} to an Admin`);
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

<ProjectSettingsLayout
    allScrollable={false}
    isCurrentUserAdmin={isCurrentUserAdmin.value ?? false}
    {projectId}
    selectedTab="members"
>
    {#if isCurrentUserAdmin.value ?? false}
        <div class="flex flex-row items-center justify-between pr-2.5">
            <h1>Manage Access</h1>
            {#if reloadingMembers}
                <div class="flex flex-row gap-3 text-lg text-gray-400">
                    <LoaderCircle class="animate-spin" />
                    <span>Reloading Members</span>
                </div>
            {/if}
            <InviteUsersDialog
                disabled={reloadingMembers || isProjectArchived}
                loadingMembers={loadingMembersLocal}
                {onUsersInvited}
                {projectId}
            />
        </div>
    {:else}
        <h1>Members</h1>
    {/if}
    <ScrollArea class="flex h-full overflow-hidden pr-2.5">
        <ul
            class="flex h-fit w-full flex-col gap-3 rounded-md border py-2.5"
            data-testid="project-member-list"
        >
            {#await loadingMembersLocal}
                {#each { length: numberOfSkeletons }, i}
                    <ProjectMemberListEntrySkeleton />
                    {#if i < numberOfSkeletons - 1}
                        <Separator />
                    {/if}
                {/each}
            {:then members}
                {#each members as member, i (member.user!.email)}
                    <ProjectMemberListEntry
                        disabled={reloadingMembers || isProjectArchived}
                        isAdminView={isCurrentUserAdmin.value ?? false}
                        isCurrentUser={member.user!.id === user.id}
                        {member}
                        {onMemberPromoted}
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
            {:catch}
                <li class="m-auto py-4">
                    <ErrorIndicator errorMessage="Couldn't load project members" />
                </li>
            {/await}
        </ul>
    </ScrollArea>
</ProjectSettingsLayout>
