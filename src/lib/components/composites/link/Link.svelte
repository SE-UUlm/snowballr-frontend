<script lang="ts">
    import type { ResolvedPathname } from "$app/types";
    import type { WithElementRef } from "bits-ui";
    import type { HTMLAnchorAttributes } from "svelte/elements";

    type Props = Omit<WithElementRef<HTMLAnchorAttributes>, "href"> & {
        href?: ResolvedPathname;
    };

    const { href, children, ...restProps }: Props = $props();
</script>

<!--
@component
Wrapper for an anchor element with statically typed href prop.
-->
<!-- see https://github.com/sveltejs/eslint-plugin-svelte/issues/1319 -->
<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
<a {href} {...restProps}>
    {@render children?.()}
</a>
