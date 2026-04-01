<script lang="ts">
    import * as Avatar from "$lib/components/primitives/avatar/index.js";
    import Check from "@lucide/svelte/icons/check";
    import X from "@lucide/svelte/icons/x";
    import { ReviewDecision } from "$api/review";
    import type { User } from "$api/user";
    import { cn } from "$lib/utils/shadcn-helper";
    import Tooltip from "$lib/components/composites/utils/Tooltip.svelte";

    interface Props {
        user?: User;
        reviewDecision?: ReviewDecision;
        size?: "default" | "small";
        showUsernameOnHover?: boolean;
    }

    const { user, reviewDecision, size = "default", showUsernameOnHover = true }: Props = $props();

    const getInitial = (text: string) => (text.length > 0 ? text[0].toUpperCase() : "");
    const userInitials = $derived(
        `${getInitial(user?.firstName ?? "")}${getInitial(user?.lastName ?? "")}`,
    );

    function getStyle() {
        return size === "default"
            ? {
                  iconSize: 16,
                  avatarSize: "size-10",
                  textSize: "text-[1rem]",
                  reviewIndicatorClass: "review-decision-icon-bg-default",
              }
            : {
                  iconSize: 12.8,
                  avatarSize: "size-8",
                  textSize: "text-[.8rem]",
                  reviewIndicatorClass: "review-decision-icon-bg-small",
              };
    }

    const style = getStyle();
</script>

<!--
@component
Avatar displaying the initials of the user (identified by its id)
or a profile image.

This avatar component displays the set profile image or, if
no image was set, the initials of the user. For instance, the
name of the user is 'John Doe', this avatar will display
the initials 'JD'.

If the option `showUsernameOnHover` is set to true, then the full name is displayed as
tooltip, when the user hovers over the avatar.

Optionally, a `reviewDecision` can be added that adds a visualization for
a decision of the associated user, which can be used for example
in the PaperEntry component.

There are two different sizes:
- "default": 40x40px (default)
- "small": 80% of "default" i.e. 32x32px

Usage:
```svelte
    <UserAvatar user={{
        id: "1",
        email: "john@doe.com",
        firstName: "John",
        lastName: "Doe",
        role: UserRole.DEFAULT,
        status: UserStatus.ACTIVE,
    }} reviewDecision={ReviewDecision.ACCEPTED} showUsernameOnHover={false} />
```
-->
<div class="relative" data-testid="user-avatar">
    {#snippet avatar()}
        <Avatar.Root class={style.avatarSize}>
            <Avatar.Fallback
                class={cn("group-hover/paper-list-entry:bg-slate-200", style.textSize)}
            >
                {userInitials}
            </Avatar.Fallback>
        </Avatar.Root>
    {/snippet}
    {#if showUsernameOnHover}
        <Tooltip>
            {#snippet trigger()}
                {@render avatar()}
            {/snippet}
            {#snippet content()}
                {user === undefined ? "Unknown" : `${user.firstName} ${user.lastName}`}
            {/snippet}
        </Tooltip>
    {:else}
        {@render avatar()}
    {/if}
    {#if reviewDecision === ReviewDecision.ACCEPTED}
        <div class={cn(style.reviewIndicatorClass, "bg-accept-green")}>
            <Check color="#ffffff" size={style.iconSize} strokeWidth="3" />
        </div>
    {:else if reviewDecision === ReviewDecision.DECLINED}
        <div class={cn(style.reviewIndicatorClass, "bg-decline-red")}>
            <X color="#ffffff" size={style.iconSize} strokeWidth="3" />
        </div>
    {:else if reviewDecision === ReviewDecision.MAYBE}
        <div class={cn(style.reviewIndicatorClass, "bg-maybe-yellow")}>
            <text class={cn("text-white", style.textSize)}>?</text>
        </div>
    {/if}
</div>
