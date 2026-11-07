import type { ResolvedPathname } from "$app/types";
import type { LucideIcon } from "@lucide/svelte";

interface Tab {
    value: string;
    label: string;
}

type LinkTab = Tab & { href: ResolvedPathname };

type IconLinkTab = LinkTab & {
    icon: LucideIcon;
};

type UserMenuTab = IconLinkTab & {
    shortcut: string;
};

export type { Tab, LinkTab, IconLinkTab, UserMenuTab };
