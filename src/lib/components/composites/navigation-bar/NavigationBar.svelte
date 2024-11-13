<script lang="ts">
    import ArrowLeft from "lucide-svelte/icons/arrow-left";
    import * as Avatar from "$lib/components/primitives/avatar/index.js";
    import * as Card from "$lib/components/primitives/card/index.js";
    import * as Tabs from "$lib/components/primitives/tabs/index.js";
    import * as DropdownMenu from "$lib/components/primitives/dropdown-menu/index.js";
    import BookOpen from "lucide-svelte/icons/book-open";
    import Archive from "lucide-svelte/icons/archive";
    import Inbox from "lucide-svelte/icons/inbox";
    import Settings from "lucide-svelte/icons/settings";
    import LogOut from "lucide-svelte/icons/log-out";
    import type { ComponentType, Snippet } from "svelte";
    import type { Icon } from "lucide-svelte";

    interface Props {
        user: { firstName: string; lastName: string };
        backRef?: string | undefined;
        tabs: {
            value: string;
            label: string;
            href: string;
        }[];
        defaultTabValue: string;
        children: Snippet<[]>;
    }

    const {
        user,
        backRef = undefined,
        tabs = [],
        defaultTabValue = "",
        children,
    }: Props = $props();
    const getInitial = (text: string) => (text.length > 0 ? text[0].toUpperCase() : "");
    const userInitials = `${getInitial(user.firstName)}${getInitial(user.lastName)}`;
    const menuItems: {
        // The icon library still uses the depracted ComponentType type
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

<Card.Root class="shadow-lg w-fit">
    <Card.Content class="grid grid-flow-col gap-[0.625rem] items-center px-4 py-3">
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Avatar.Root>
                    <Avatar.Fallback>{userInitials}</Avatar.Fallback>
                </Avatar.Root>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content class="w-56">
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
                                    <DropdownMenu.Shortcut>{item.shortcut}</DropdownMenu.Shortcut>
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
        {#if backRef !== undefined}
            <a href={backRef}><ArrowLeft class="w-6 h-6" /></a>
        {/if}
        <!-- Children can be e.g. a title element -->
        {@render children()}
        {#if tabs.length > 0}
            <Tabs.Root value={defaultTabValue}>
                <Tabs.List>
                    {#each tabs as tab}
                        <a href={tab.href}>
                            <Tabs.Trigger value={tab.value}>
                                <span class="font-semibold">{tab.label}</span>
                            </Tabs.Trigger>
                        </a>
                    {/each}
                </Tabs.List>
            </Tabs.Root>
        {/if}
    </Card.Content>
</Card.Root>
