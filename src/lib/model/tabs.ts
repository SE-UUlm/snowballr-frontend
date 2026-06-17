import type { ResolvedPathname } from "$app/types";
import type { Icon } from "@lucide/svelte";

interface Tab {
    value: string;
    label: string;
}

type LinkTab = Tab & { href: ResolvedPathname };

type IconLinkTab = LinkTab & {
    icon: typeof Icon;
};

type UserMenuTab = IconLinkTab & {
    shortcut: string;
};

export type { Tab, LinkTab, IconLinkTab, UserMenuTab };
