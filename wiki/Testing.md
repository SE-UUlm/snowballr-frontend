To test the functionality of our app, we employ unit, integration, and end-to-end tests. To run all tests at once,
you can use:

```bash
npm run test
```

or

```bash
npm run test:and-open-coverage
```

to run the test and open the generated coverage report.
On this page, we will cover the following topics:

- [Test Data](#test-data)
- [Conventions](#conventions)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [End-to-End Tests](#end-to-end-tests)
  - [Requirements](#requirements)
  - [Best Practices](#best-practices)
- [Visual Regression Tests](#visual-regression-tests)
  - [How It Works](#how-it-works)
  - [Writing a Visual Test](#writing-a-visual-test)
  - [Updating Baselines](#updating-baselines)
  - [Bumping Playwright or the Mock Backend](#bumping-playwright-or-the-mock-backend)

## Test Data

To use test data in the tests, you can either use the
[example data](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/example-data.ts) or the
[model builder](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/model-builder.ts).
In general, it makes sense to use the model builder to create test data, as it is more flexible and easier to use.

> **Note**: Do not expect that the example data never changes, so it is better to use the model builder and overwrite
> the values you need.

The [visual regression tests](#visual-regression-tests) are an exception: they use their own fixed data, because every
change to the data changes the screenshots.

## Conventions

- For single test cases, we use the _when-then_ pattern, e.g. `test("When ..., then ...", () => { ... })`. This makes it
  easier to understand what the test is about and what happens under what conditions.
- We use the `describe` function to group tests that belong together, e.g. a function
  (`describe("foo()", () => { ... })`) or a component (`describe("MyComponent", () => { ... })`).

## Unit Tests

Unit tests are used to test individual functions or components in isolation. They are located in the
[tests/unit](https://github.com/SE-UUlm/snowballr-frontend/tree/develop/tests/unit) directory. Run them with:

```bash
npm run test:unit
```

## Integration Tests

Integration tests are used to test the interaction between different components or functions. They are located in the
[tests/integration](https://github.com/SE-UUlm/snowballr-frontend/tree/develop/tests/integration) directory.
Run them with:

```bash
npm run test:integration
```

The location of the tests should mirror the location of the components they are testing. For example, a test for a
component located at `src/lib/components/composites/group/MyComponent.svelte` should be located at
`tests/integration/group/MyComponent.test.ts`. To easily test components and user interaction, we use the
[testing-library](https://testing-library.com/docs/svelte-testing-library/intro/) and
[user-event](https://testing-library.com/docs/user-event/intro/) packages. They provide a simple and intuitive way
to test components and user interaction. For example, to test if a button is clicked, you can use the following code:

```ts
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import MyComponent from "./MyComponent.svelte";

test("When the button is clicked, then the text should change", async () => {
  const user = userEvent.setup();
  render(MyComponent, {
    target: document.body,
    props: {
      // Here you can pass props to the component
      text: "Old text",
    },
  });

  const button = screen.getByRole("button");
  user.click(button);

  expect(screen.getByText("New text")).toBeInTheDocument();
});
```

In many components, we use skeletons to show loading states. To test these components, when they are finished loading,
use `await waitForComponentLoading();`. Prefer using `screen` to query elements in the DOM and test IDs or roles
instead of classes or text content.

Sometimes, it is necessary to test the interaction with the backend. For this, we mock API calls.

For successful API calls, we can use the `mockApiCall` function to mock the API call and return a successful response.
For example, to mock a successful API call to the `getAllUsers` endpoint, you can use the following code:

```ts
mockApiCall("getAllUsers", {
  users: [Users.johnDoe, Users.janeDoe, Users.henryMoore],
});
```

For failed API calls, we can use the `mockFailedApiCall` function to mock the API call and return an error response.
For example, to mock a failed API call to the `getAllUsers` endpoint, you can use the following code:

```ts
mockFailedApiCall("getAllUsers");
```

## End-to-End Tests

End-to-End (E2E) tests verify the full functionality of the application in a realistic browser environment.
In this project, we use [Playwright](https://playwright.dev/) to implement and run E2E tests.
The tests are located in the [tests/e2e](https://github.com/SE-UUlm/snowballr-frontend/tree/develop/tests/e2e) directory
and can be run with:

```bash
npm run test:e2e
```

To only execute the tests related to changes (compared to the `develop` branch), run:

```bash
npm run test:e2e:fast
```

As running the entire end-to-end test suite can take some time, this can be useful for testing new
end-to-end tests and getting feedback on them more quickly.

### Requirements

The E2E tests require a mock backend to be running for each supported browser (Chromium, Firefox, and WebKit).
These mock backends simulate the backend responses.

The E2E tests will automatically create these mock backends using docker,
requiring it to be installed and running.

### Best Practices

1. **Use the test fixture**:
   Instead of importing the `test` fixture directly from "@playwright/test",
   use the `test` variable exported from one of the following:
   - [`utils/fixtures/shared-fixture.ts`](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/e2e/utils/fixtures/shared-fixture.ts)
     (a new mock backend is started for each worker)
   - [`utils/fixtures/isolated-fixture.ts`](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/e2e/utils/fixtures/isolated-fixture.ts)
     (a new mock backend is started for each test)

   This ensures that the API calls to the mock backend are automatically redirected to the correct mock backend
   instance based on the browser the test is running in.

   In general, it makes sense to create an own fixture for each test class to set up the tests and to use an object in
   multiple tests or run a certain function before / after each test. Instead of using `beforeAll` or `afterAll` in the
   test classes implement the setup code in the fixture, to create
   a strict separation between the setup and the tests.

   The name of a fixture must follow the convention `custom-name-page-fixture.ts`.

2. **Use Page Object Models (POMs)**:
   To make tests more maintainable and readable, use page object models (POMs) to encapsulate UI logic.
   For example, the [`homepage/create-project-dialog-model.ts`](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/e2e/homepage/create-project-dialog-model.ts)
   file wraps a page with custom selectors and helper functions for the `CreateProjectDialog` component,
   improving clarity and reusability across tests. In particular, these POMs can be wrapped in a fixture
   so that they can be accessed directly in each test without having to create a separate POM in each test.

   Make sure that every page, dialog, navigation- or sidebar has its own model. The attributes and functions
   to access any element must be declared in the according model to ensure reusability. Only use functions that
   click multiple elements if they are really needed. In general, the intention is to simulate the user behavior
   as good as possible by simulating each click in the tests.

   The name of the model is defined by the following guidelines:
   - `custom-name-page-model.ts` (if the model represents a full page)
   - `custom-name-navigation-bar-model.ts` (if the model represents a navigation bar)
   - `custom-name-sidebar-model.ts` (if the model represents a sidebar)
   - `custom-name-dialog-model.ts` (if the model represents a dialog)

3. **Test classes**:
   The classes are only used to test. They shall not include any (setup) functions or call any POM
   elements themselves. It is recommended to simulate every single user click to test an use case
   in the according tests. Do not use functions that include several clicks (due to clarity and
   readability).

   The name of a test must follow the convention `custom-name-page.test.ts`. If there are different use cases
   that are tested, they are still located in the test file for the according page. In this file each use case is
   tested in its own `describe` block.

For more advanced usage and documentation, refer to the official [Playwright documentation](https://playwright.dev/).

## Visual Regression Tests

Visual regression tests detect unintended changes to the appearance of the app, e.g. after bumping a UI library like
`bits-ui`. They take screenshots of pages and components and compare them pixel by pixel to committed baselines.
They are a separate Playwright suite located in the
[tests/visual](https://github.com/SE-UUlm/snowballr-frontend/tree/develop/tests/visual) directory, configured in
[`playwright.visual.config.ts`](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/playwright.visual.config.ts),
and are not part of `npm run test:e2e`. Run them with:

```bash
npm run test:visual
```

If a screenshot differs, the test fails and the report shows the expected, actual and diff images:

```bash
npm run test:visual:show-report
```

In CI, the job _Visual Regression Testing with Playwright_ always runs the complete suite, never only the tests related
to changes, since e.g. a dependency bump changes the appearance without touching any test. Like the E2E tests, it is
sharded by `TESTS_PER_SHARD`. It fails on any difference and uploads the report of each shard as a `visual-report-<n>`
artifact.

### How It Works

Screenshots only match if they are always rendered by the same browser build with the same fonts. The app uses the
system font stack, so a screenshot taken on your machine would differ from one taken in CI. Therefore, the browser does
not run on your machine, but in the official
[Playwright Docker image](https://playwright.dev/docs/docker) (`playwright run-server`), both locally and in CI:

- [`scripts/run-visual-tests.js`](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/scripts/run-visual-tests.js)
  starts the container, runs Playwright against it and stops the container again. The image tag is taken from the
  installed `@playwright/test` version in `package-lock.json`, as client and server versions must match exactly.
- The tests themselves, the preview server of the frontend and the mock backends still run on your machine.
  `exposeNetwork: "<loopback>"` lets the browser in the container reach them via `localhost`, so the regular E2E
  fixtures and POMs can be reused.
- Only Firefox with the `Desktop Firefox` viewport (1280×720), the `en-US` locale and the `UTC` timezone is used. The
  comparison is strict (no differing pixels allowed) and failed tests are not retried, as a visual difference is
  deterministic.

Like the E2E tests, the visual tests require Docker to be installed and running. Without it, the scripts fail
immediately.

### Writing a Visual Test

Visual tests are named `custom-name.visual.ts` and follow the same [conventions](#conventions) as the other tests.
Reuse the POMs of the E2E tests to locate elements. A test should:

1. **Use the visual fixture**: Import `test` from
   [`tests/visual/utils/visual-fixture.ts`](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/visual/utils/visual-fixture.ts).
   It extends the isolated fixture (one fresh mock backend per test) and
   - freezes the browser clock, so dates and relative times never change, and
   - replaces the project dates that the mock backend sets from its own clock with fixed ones.

   Request the `visualData` fixture to seed the
   [fixed visual test data](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/visual/utils/visual-data.ts)
   and to get the ids of the created objects. Tests that don't request it start with an empty account, e.g. to cover
   empty states.

2. **Wait until the page has settled**: Use `gotoAndSettle(page, url, ready)` or `settle(page, ready)` from
   [`tests/visual/utils/helper.ts`](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/visual/utils/helper.ts)
   with an element that is only visible once the data has loaded, so no skeletons end up in the screenshot.

3. **Take the screenshot**:
   - Pages: `await expect(page).toHaveScreenshot("name.png", { fullPage: true });`
   - Overlays that are positioned relative to their trigger (menus, dropdowns, tooltips): a page screenshot, so the
     placement is covered as well.
   - Dialogs: an element screenshot, e.g. `await expect(dialog).toHaveScreenshot("name-dialog.png");`

   The content of most pages scrolls inside a scroll area, so `fullPage` only contains what fits into the viewport. Call
   `expandViewportToFitScrollAreas(page)` before the screenshot to include the content below it.

Keep the screenshots deterministic:

- Only use the fixed visual test data, never the example data or the model builder. Create additional data through the
  API **one after another** (not with `Promise.all`), as the mock backend assigns ids sequentially.
- Animations are disabled and the text cursor is hidden for all screenshots (see the config).
- If a value can't be pinned, hide it with the
  [`mask`](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-1-option-mask)
  option. Keep in mind that a masked value whose width changes still shifts the content around it.

Finally, run the new test a few times to make sure it is stable:

```bash
npm run test:visual -- tests/visual/path/to/new.visual.ts --repeat-each=5
```

### Updating Baselines

The baselines are stored next to the tests in `*.visual.ts-snapshots/` directories and committed as regular files (no
Git LFS). When you change the appearance on purpose or add a new test, create or update the baselines with:

```bash
npm run test:visual:update
```

This rewrites only the baselines that differ or are missing, and afterwards compresses them losslessly with
[oxipng](https://github.com/shssoichiro/oxipng). Then check the changed PNGs in the diff of your commit, and only commit
them if every change is intended. As the browser runs in the same Docker image everywhere, baselines created on your
machine are valid in CI.

### Bumping Playwright or the Mock Backend

- **Playwright**: A new version comes with a new browser build, which may render some pixels differently, so a bump
  (e.g. by Dependabot) may fail the visual tests. The scripts pick up the new Docker image automatically. Check out the
  branch, run `npm run test:visual:update`, review the changed baselines and commit them to that branch.
- **Mock backend**: The visual test data is created through the API of the mock backend
  ([`mock-backend-version.js`](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/e2e/utils/helper/mock-backend-version.js)),
  so a changed behavior can change the screenshots as well. Proceed in the same way.
