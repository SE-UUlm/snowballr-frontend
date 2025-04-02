import type { Icon } from "lucide-svelte";
import type { ComponentType } from "svelte";

interface Tab {
    value: string;
    label: string;
}

type LinkTab = Tab & { href: string };

type IconLinkTab = LinkTab & {
    // The icon library still uses the deprecated ComponentType type
    icon: ComponentType<Icon>;
};

type UserMenuTab = IconLinkTab & {
    shortcut: string;
};

export type { Tab, LinkTab, IconLinkTab, UserMenuTab };
