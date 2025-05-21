<script lang="ts">
    import * as DropdownMenu from "$lib/components/primitives/dropdown-menu/index.js";
    import BookOpen from "lucide-svelte/icons/book-open";
    import Archive from "lucide-svelte/icons/archive";
    import Inbox from "lucide-svelte/icons/inbox";
    import Settings from "lucide-svelte/icons/settings";
    import LogOut from "lucide-svelte/icons/log-out";
    import type { User } from "$lib/model/api/user";
    import UserAvatar from "$lib/components/composites/user-avatar/UserAvatar.svelte";
    import type { UserMenuTab } from "$lib/model/tabs";

    interface Props {
        user: User;
    }
    const { user }: Props = $props();

    const menuItems: UserMenuTab[] = [
        {
            value: "reading-list",
            label: "Reading List",
            href: "/readinglist",
            icon: BookOpen,
            shortcut: "⌘⇧R",
        },
        {
            value: "archived-projects",
            label: "Archived Projects",
            href: "/archivedprojects",
            icon: Archive,
            shortcut: "⌘⇧A",
        },
        {
            value: "invitations",
            label: "Invitations",
            href: "/invitations",
            icon: Inbox,
            shortcut: "⌘⇧I",
        },
        {
            value: "settings",
            label: "Settings",
            href: "/settings/account",
            icon: Settings,
            shortcut: "⌘⇧S",
        },
    ];
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        <UserAvatar showUsernameOnHover={false} {user} />
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-60" align="start" side="bottom" sideOffset={0}>
        <DropdownMenu.Group>
            <DropdownMenu.GroupHeading>
                {`${user.firstName} ${user.lastName}`}
            </DropdownMenu.GroupHeading>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
                {#each menuItems as item (item.value)}
                    <a href={item.href}>
                        <DropdownMenu.Item>
                            <item.icon class="mr-2 size-4" />
                            <span>{item.label}</span>
                            <DropdownMenu.Shortcut>
                                {item.shortcut}
                            </DropdownMenu.Shortcut>
                        </DropdownMenu.Item>
                    </a>
                {/each}
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <a href="/signout">
                <DropdownMenu.Item>
                    <LogOut class="mr-2 size-4" />
                    <span>Sign Out</span>
                    <DropdownMenu.Shortcut>⌘⇧Q</DropdownMenu.Shortcut>
                </DropdownMenu.Item>
            </a>
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>
