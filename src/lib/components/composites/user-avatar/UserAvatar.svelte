<script lang="ts">
    import * as Avatar from "$lib/components/primitives/avatar/index.js";
    import Check from "lucide-svelte/icons/check";
    import X from "lucide-svelte/icons/x";
    import { ReviewDecision } from "$lib/model/api/review";
    import type { User } from "$lib/model/api/user";
    import { cn } from "$lib/utils/shadcn-helper";

    interface Props {
        user?: User;
        reviewDecision?: ReviewDecision;
        size?: "default" | "small";
    }

    const { user, reviewDecision, size = "default" }: Props = $props();

    const getInitial = (text: string) => (text.length > 0 ? text[0].toUpperCase() : "");
    const userInitials = `${getInitial(user?.firstName ?? "")}${getInitial(user?.lastName ?? "")}`;
    const style =
        size === "default"
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
</script>

<!--
@component
Avatar displaying the initials of the user (identified by its id)
or a profile image.

This avatar component displays the set profile image or, if
no image was set, the initials of the user. For instance, the
name of the user is 'John Doe', this avatar will display
the initials 'JD'.

Optionally, a reviewDecision can be added, which visualizes
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
    }} reviewDecision={ReviewDecision.ACCEPTED} />
```
-->
<div class="relative" data-testid="user-avatar">
    <Avatar.Root class={style.avatarSize}>
        <Avatar.Fallback class={cn("group-hover/paper-list-entry:bg-slate-200", style.textSize)}>
            {userInitials}
        </Avatar.Fallback>
    </Avatar.Root>
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
