<script lang="ts">
    import ArrowLeft from "lucide-svelte/icons/arrow-left";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import BookOpen from "lucide-svelte/icons/book-open";
    import Archive from "lucide-svelte/icons/archive";
    import Inbox from "lucide-svelte/icons/inbox";
    import Settings from "lucide-svelte/icons/settings";
    import LogOut from "lucide-svelte/icons/log-out";

    export let user: {
        firstName: string;
        lastName: string;
    };
    export let backRef: string = "";
    export let pageTitle: string = "Project 1";
    export let tabs: {
        value: string;
        label: string;
        href: string;
    }[] = [];
    export let defaultTabValue: string = "";
    const getInitial = (text: string) => (text.length > 0 ? text[0].toUpperCase() : "");
    const userInitials = `${getInitial(user.firstName)}${getInitial(user.lastName)}`;
    const menuItems: {
        /* eslint-disable @typescript-eslint/no-explicit-any*/
        icon: any;
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
    <Card.Content class="p-4 grid grid-flow-col gap-[10px] items-center">
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Avatar.Root>
                    <Avatar.Fallback>{userInitials}</Avatar.Fallback>
                </Avatar.Root>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content class="w-56">
                <DropdownMenu.Group>
                    <DropdownMenu.GroupHeading>
                        {user.firstName}
                        {user.lastName}
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
        <a href={backRef}><ArrowLeft class="w-6 h-6" /></a>
        <h1 class="text-[28px] font-semibold place-content-center">{pageTitle}</h1>
        <Tabs.Root value={defaultTabValue}>
            <Tabs.List>
                {#each tabs as tab}
                    <Tabs.Trigger value={tab.value}>
                        <a href={tab.href}>{tab.label}</a>
                    </Tabs.Trigger>
                {/each}
            </Tabs.List>
        </Tabs.Root>
    </Card.Content>
</Card.Root>
