<script lang="ts">
    import * as DropdownMenu from "$lib/components/primitives/dropdown-menu/index.js";
    import BookOpen from "lucide-svelte/icons/book-open";
    import Settings from "lucide-svelte/icons/settings";
    import LogOut from "lucide-svelte/icons/log-out";
    import UserAvatar from "$lib/components/composites/user-avatar/UserAvatar.svelte";
    import type { UserMenuTab } from "$lib/model/tabs";
    import { getUserContext } from "$lib/custom-context/user-context";

    const user = $derived(getUserContext());

    const menuItems: UserMenuTab[] = [
        {
            value: "reading-list",
            label: "Reading List",
            href: "/readinglist",
            icon: BookOpen,
            shortcut: "⌘⇧R",
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
