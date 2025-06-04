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

## Test Data

To use test data in the tests, you can either use the
[example data](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/example-data.ts) or the
[model builder](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/model-builder.ts).
In general, it makes sense to use the model builder to create test data, as it is more flexible and easier to use.

> **Note**: Do not expect that the example data never changes, so it is better to use the model builder and overwrite
> the values you need.

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
   Instead of importing the `test` fixture directly from "@playwright/test" directly,
   use the `test` variable exported from [`utils/fixtures/shared-fixture.ts`](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/e2e/utils/fixtures/shared-fixture.ts).
   This ensures that the API calls to the mock backend are automatically redirected to the correct mock backend
   based on the browser the test is running in.

   In general, it makes sense to create an own fixture, if you want to use an object in multiple tests or
   run a certain function before / after each test.

2. **Use Page Object Models (POMs)**:
   To make tests more maintainable and readable, use page object models (POMs) to encapsulate UI logic.
   For example, the [`homepage/create-project-dialog-model.ts`](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/e2e/homepage/create-project-dialog-model.ts)
   file wraps a page with custom selectors and helper functions for the `CreateProjectDialog` component,
   improving clarity and reusability across tests. In particular, these POMs can be wrapped in a fixture
   so that they can be accessed directly in each test without having to create a separate POM in each test.

For more advanced usage and documentation, refer to the official [Playwright documentation](https://playwright.dev/).
