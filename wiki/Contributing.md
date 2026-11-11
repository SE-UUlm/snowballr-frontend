In this section, we explain how to contribute to the Snowballr frontend project. We cover the following topics:

- [Project Layout](#project-layout)
- [Creating a New Component](#creating-a-new-component)
  - [How to Pass HTML Attributes to a custom component](#how-to-pass-html-attributes-to-a-custom-component)
  - [Skeletons](#skeletons)
  - [Loading state on actions](#loading-state-on-actions)
- [User Context](#user-context)
  - [How the User is Fetched and Made Available](#how-the-user-is-fetched-and-made-available)
  - [How to Use the User Context in Components](#how-to-use-the-user-context-in-components)
  - [Refreshing User Data](#refreshing-user-data)
- [Testing](#testing)
- [Release Procedure](#release-procedure)

To set up the development environment, follow the steps in
[Getting Started](https://github.com/SE-UUlm/snowballr-frontend/wiki/Getting-Started).

## Project Layout

```plaintext
.
├── scripts/                (helper scripts used in CI/CD or development)
├── src/
│   ├── lib/
│   │   ├── api/            (backend access, see Backend Access)
│   │   ├── components/
│   │   │   ├── composites/ (our components)
│   │   │   └── primitives/ (shadcn/ui components)
│   │   └── model/          (frontend models and helpers)
│   └── routes/             (website layout)
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── unit/
└── wiki/                   (this wiki)
```

## Creating a New Component

When creating a new component, please follow these guidelines:

1. **Location**: Place your component in the appropriate directory under `src/lib/components/`. Use `composites/` for
   custom components and `primitives/` for shadcn/ui components (refer to
   [the installation guide](https://shadcn-svelte.com/docs/installation/sveltekit)).
2. **Naming**: Use PascalCase for component files (e.g., `MyComponent.svelte`) and kebab-case for normal TS files (e.g.,
   `my-helper.ts`)
3. **Props**: Clearly define the props your component accepts. Use TypeScript for type safety.
4. **Documentation**: Add comments to your component to explain its purpose, usage and the meaning of its props.
5. **Testing**: Write integration tests for your component in the `tests/integration/` directory to ensure its
   functionality (see [the testing section](#testing)).

Example structure for `MyNewComponent`:

```svelte
<script lang="ts">
  // Imports

  // Component Props interface
  interface Props {
    foo: string;
    bar: number;
    children?: Snippet | undefined; // <- children are sub-components that can be rendered inside a component
  }

  let { foo, bar, children = undefined }: Props = $props();

  // More functions, variables, logic, ...
</script>

<!--
@component
This is my new component.

Usage:
\`\`\`svelte
    <MyNewComponent foo="Example" bar={0}>
        <span>This is a span!</span>
    </MyNewComponent>
\`\`\`
-->
<div>
  <h1>{foo}</h1>
  <span>{bar}</span>
  <div>{@render children?.()}</div>
</div>
```

The [NavigationBar component](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/src/lib/components/composites/navigation-bar/NavigationBar.svelte)
is a good example of a well-structured component.

### How to Pass HTML Attributes to a custom component

Sometimes we want to set HTML attributes inside the component from outside when using it. For this we can change the
`Props` interface. From:

```svelte
<script lang="ts">
  interface Props {
    foo: string;
    bar: number;
    children?: Snippet | undefined;
  }
</script>
```

To:

```svelte
<script lang="ts">
  type Props = WithElementRef<HTMLButtonAttributes> & {
    foo: string;
    bar: number;
    children?: Snippet | undefined;
  };
  // or if the required Attributes type doesn't exist
  type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    /** ... */
  };

  // Now we can use the HTML attributes as normal props
  let { foo, string, children = undefined, class: className, ...restProps }: Props = $props();
</script>

<!-- Now we use the props on native HTML elements -->
<div class={cn("w-40", className)} {...restProps}>
  <h1>{foo}</h1>
  <span>{bar}</span>
  <div>{@render children?.()}</div>
</div>
```

For an example of this, see the
[ToggleableInput component](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/src/lib/components/composites/input/ToggleableInput.svelte).

### Skeletons

When loading data asynchronously, it's a good practice to show skeletons to indicate that content is being loaded. This
improves user experience by providing visual feedback during loading times. We use the
[shadcn/ui Skeleton component](https://shadcn-svelte.com/docs/components/skeleton) for this purpose. Often, we pass
promises to components and use the `await` block to handle loading states.

Here's an example of how to implement skeletons in a component:

```svelte
<script lang="ts">
  import { Skeleton } from "$lib/components/primitives/skeleton";

  interface Props {
    loadingData: Promise<ExampleData>;
  }

  const { loadingData }: Props = $props();
</script>

{#await loadingData}
  <!-- Render skeletons while data is loading -->
  <div class="space-y-2">
    <Skeleton class="h-6 w-3/4" />
    <Skeleton class="h-4 w-full" />
    <Skeleton class="h-4 w-5/6" />
  </div>
{:then data}
  <!-- Render actual content when data is loaded -->
  <div>
    <h1>{data.title}</h1>
    <p>{data.description}</p>
  </div>
{:catch error}
  <!-- Handle error state -->
  <div class="text-red-500">Error loading data: {error.message}</div>
{/await}
```

For a real-world example, see the
[ProjectInformation component](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/src/lib/components/composites/statistics/ProjectInformation.svelte).

### Loading state on actions

While skeletons are great for initial data loading, it's also important to provide feedback during user-initiated
actions that may take time to complete, such as form submissions or data updates. Since these are often triggered by
buttons, we built a
[LoadingButton component](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/src/lib/components/composites/button/LoadingButton.svelte)
that extends the standard button functionality to include a loading state. Itself has a rich documentation on how to use
it. For an example of its usage, see the
[ChangeNameSettings component](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/src/lib/components/composites/settings/user-settings/ChangeNameSettings.svelte).

The key concepts to consider when implementing loading states on actions are:

- Disable the button while loading the page
- Show a spinner or loading indicator on the button when the action is in progress
- Disable the button while loading to prevent multiple submissions
- Change the button text to indicate the loading state (e.g., "Saving..." instead of "Save")
- Set a fix width to prevent layout shifts when the button text changes
- Provide feedback upon completion (e.g., success or error messages) through toasts or alerts

## User Context

The application provides a global user context that makes the currently authenticated user's data available throughout
the component tree.

### How the User is Fetched and Made Available

```mermaid
graph TD
    A[Root layout.ts]
    B{User cached?}
    C[Use cached user]
    D[Check auth/session]
    E{Session valid?}
    F[Use fetched user]
    G[Redirect to sign-in]
    H[Inject user into context]
    I[Components use context]

    A --> B
    B -->|Yes| C --> H
    B -->|No| D --> E
    E -->|Yes| F --> H
    E -->|No| G
    H --> I
```

The initial user loading logic lives in the root
[layout.ts](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/src/routes/%2Blayout.ts)
file. It checks whether a user is already cached using the `userCache`. If no cached user is found, it attempts to
determine the current authentication status and fetch the user accordingly. If the user is unauthenticated or the
session is invalid, it tries to renew the session or redirects to the sign-in page if necessary.

The resulting user object—whether fetched, cached, or an explicit "empty" user—is returned from `layout.ts` and injected
into the user context by the root
[layout.svelte](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/src/routes/%2Blayout.svelte) file. This
ensures the user state is consistent and accessible throughout the app.

Components can safely assume that the user object is always valid and never `null` or `undefined`. In cases where the
user is not authenticated, the app will redirect to the sign-in page before components are rendered. This eliminates
the need for `null` checks in downstream components that rely on user data.

### How to Use the User Context in Components

To access the current user's data within any Svelte component that is a child of the main layout use
`getUserContext`. Wrap this in `$derived` to create a reactive variable that automatically updates when the user
context changes.

```svelte
<script lang="ts">
  import { getUserContext } from "$lib/custom-context/user-context";

  const user = $derived(getUserContext());

  function greet() {
    console.log(`Hello, ${user.firstName}!`);
  }
</script>

<p>Welcome, {user.firstName} {user.lastName}!</p>
```

### Refreshing User Data

If an action within a component modifies user data on the backend (e.g. updating profile information), you'll need to
trigger a refresh of the user context to ensure all parts of the application have the latest data.

1. Import the refresh function:

   ```svelte
   import {triggerCurrentUserRefresh} from "$lib/current-user/userCache";
   ```

2. Call the function after an update:

   ```svelte
   <script lang="ts">
     import { updateUserName } from "$lib/api/user";
     import { triggerCurrentUserRefresh } from "$lib/current-user/userCache";
     import { getUserContext } from "$lib/custom-context/user-context";
     import { toast } from "svelte-sonner";

     const user = $derived(getUserContext());

     async function handleNameUpdate(firstName: string, lastName: string) {
       try {
         await updateUserName(user.id, { firstName, lastName });

         triggerCurrentUserRefresh();
         toast.success("User details updated successfully!");
       } catch (error) {
         console.error("Failed to update user:", error);
         toast.error("Failed to update user details.");
       }
     }
   </script>
   ```

## Backend Access

Routes and components reach the backend only through the domain modules in `src/lib/api/`. Only these modules import
the generated API (`snowballr-api`), the protobuf-ts runtime (`@protobuf-ts/*`) and the client. This keeps transport
details in one place, so the backend's switch from gRPC to REST
([snowballr-backend#536](https://github.com/SE-UUlm/snowballr-backend/issues/536)) changes one module per domain instead
of every call site.

```plaintext
src/lib/api/
├── client.ts       (gRPC-Web client wiring)
├── fetch.ts        (setFetch, the fetch that backend calls go through)
├── errors.ts       (ApiError, isApiError)
├── grpc.ts         (call, mapping from gRPC status codes to ApiError)
├── fieldmask.ts    (buildFieldMask)
├── types.ts        (generated types and enums for use outside the layer)
└── <domain>.ts     (one module per backend domain, e.g. project.ts, reading-list.ts)
```

Outside the layer, only the domain modules, `errors.ts`, `types.ts` and `fetch.ts` are imported. `fetch.ts` is for the
root layout, which passes the `fetch` of its load function to `setFetch`. If code outside the layer needs a generated
type that `types.ts` doesn't export yet, add it there. ESLint fails on any other import of the layer's modules,
`snowballr-api` or `@protobuf-ts/*` outside `src/lib/api/` (`no-restricted-imports` in `eslint.config.js`). Tests are
exempt and may import `snowballr-api` and the client directly.

The domain modules follow these rules:

- **Plain async functions with plain values.** For example `getProject(projectId): Promise<Project>` or
  `listProjectPapers(projectId): Promise<ProjectPaper[]>`. Callers see neither `.response` nor wrapper messages like
  `{ projectPapers }`.
- **Updates are named intents.** For example `renameProject(projectId, name)` instead of
  `updateProject({ project, mask })`. FieldMasks and generated `create()` calls stay inside `src/lib/api/`. Derive the
  mask from a sparse patch and call `create()` only when building the request: `create()` fills in every field, so a
  mask derived from its result resets all sibling fields.
- **Errors are transport-neutral.** Every function rejects with `ApiError`. Check its kind with
  `isApiError(error, "already-exists")` instead of comparing gRPC status codes.
- **No UI.** Toasts, `ActionError`, `invalidate()` and Svelte state stay in the routes and components.

A domain module wraps each client call in `call()` from `grpc.ts`, which returns the response and turns a failure into
an `ApiError`:

```ts
// src/lib/api/project.ts
import { Project } from "snowballr-api/project";
import { client } from "./client";
import { call } from "./grpc";
import { buildFieldMask } from "./fieldmask";

export async function getProject(projectId: string): Promise<Project> {
  return call(client.getProjectById({ id: projectId }));
}

export async function renameProject(projectId: string, name: string): Promise<Project> {
  const patch = { id: projectId, name };
  return call(
    client.updateProject({
      project: Project.create(patch),
      mask: buildFieldMask(patch, "project"),
    }),
  );
}
```

When a route or component needs a backend call that has no function yet, add the function to its domain module.

## Testing

For information about our testing setup, see [Testing](https://github.com/SE-UUlm/snowballr-frontend/wiki/Testing).

## Release Procedure

We create a new release whenever a set of features, bug fixes, or changes is ready to be deployed and used by the
users. To release a new version of the frontend, follow the steps in the
[SnowballR Wiki](https://github.com/SE-UUlm/snowballr/wiki/Contributing#release-procedure).
