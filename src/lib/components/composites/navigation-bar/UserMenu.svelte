<script lang="ts">
    import * as Avatar from "$lib/components/primitives/avatar/index.js";
    import * as DropdownMenu from "$lib/components/primitives/dropdown-menu/index.js";
    import BookOpen from "lucide-svelte/icons/book-open";
    import Archive from "lucide-svelte/icons/archive";
    import Inbox from "lucide-svelte/icons/inbox";
    import Settings from "lucide-svelte/icons/settings";
    import LogOut from "lucide-svelte/icons/log-out";
    import type { ComponentType } from "svelte";
    import type { Icon } from "lucide-svelte";

    interface Props {
        user: {
            firstName: string;
            lastName: string;
        };
    }
    const { user }: Props = $props();

    const getInitial = (text: string) => (text.length > 0 ? text[0].toUpperCase() : "");
    const userInitials = `${getInitial(user.firstName)}${getInitial(user.lastName)}`;
    const menuItems: {
        // The icon library still uses the deprecated ComponentType type
        icon: ComponentType<Icon>;
        label: string;
        shortcut: string;
        href: string;
    }[] = [
        {
            icon: BookOpen,
            label: "Reading List",
            shortcut: "⌘⇧R",
            href: "/readinglist",
        },
        {
            icon: Archive,
            label: "Archived Projects",
            shortcut: "⌘⇧A",
            href: "/archivedprojects",
        },
        {
            icon: Inbox,
            label: "Invitations",
            shortcut: "⌘⇧I",
            href: "/invitations",
        },
        {
            icon: Settings,
            label: "Settings",
            shortcut: "⌘⇧S",
            href: "/settings/account",
        },
    ];
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        <Avatar.Root>
            <Avatar.Fallback>{userInitials}</Avatar.Fallback>
        </Avatar.Root>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-60" side="bottom" sideOffset={0} align="start">
        <DropdownMenu.Group>
            <DropdownMenu.GroupHeading>
                {`${user.firstName} ${user.lastName}`}
            </DropdownMenu.GroupHeading>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
                {#each menuItems as item}
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
            <DropdownMenu.Item>
                <LogOut class="mr-2 size-4" />
                <span>Sign out</span>
                <DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
            </DropdownMenu.Item>
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>
