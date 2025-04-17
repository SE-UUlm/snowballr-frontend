In this section, we explain how to contribute to the Snowballr frontend project. We cover the following topics:

- [Contribution Workflow \& Conventions](#contribution-workflow--conventions)
  - [Workflow](#workflow)
  - [Commits \& Branches](#commits--branches)
- [Project Layout](#project-layout)
- [Testing](#testing)
  - [Test Data](#test-data)
  - [Conventions](#conventions)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
  - [End-to-End Tests](#end-to-end-tests)
    - [Requirements](#requirements)
    - [Best Practices](#best-practices)
- [Lighthouse](#lighthouse)

To set up the development environment, follow the steps in
[Getting Started](https://github.com/SE-UUlm/snowballr-frontend/wiki/Getting-Started).

## Contribution Workflow & Conventions

### Workflow

Starting from an issue, we create a branch with the name of the issue (see [Commits & Branches](#commits--branches)).
It's up to you, whether you create a draft pull request immediately or wait until you are finished with the
implementation. While creating a draft pull request gives you direct feedback from the CI/CD pipeline, it also clutters
the pull request list. So it's up to you, whether you want to create a draft pull request or not.

When starting to work on an issue, ensure that the issue is assigned to you and part of our project `SnowballR`.
Furthermore, make sure you set the status to `In progress` and the iteration to the current one (if that is not already
done).

When you are finished with the implementation, create a pull request (when not already done) and fill out the template.
If other branches were merged into `develop` while you were working on the issue, make sure to rebase your branch onto
the `develop` branch (`git rebase origin/develop`) and resolve any conflicts. Make sure that you don't rebase your
branch after you requested a review, as we experienced that the comments are hard to find afterward. Continue with
setting the status of the issue to `To review`. One other team member will then assign themselves as reviewer and set
the status to `In review`.

The reviewing process works as follows:

1. The reviewer will check the code and provide feedback. This can be done by adding comments to the pull request,
   preferably annotating the code directly. The reviewer can also approve the pull request if everything is fine.
2. If the reviewer requests changes, the author of the pull request (you) will either implement the changes or
   provide a reason why the changes are not necessary. In either case, the author should respond to all comments. The
   author should never resolve any comments themselves as this is the responsibility of the reviewer.
3. Once the reviewer is satisfied with the changes, they will approve the pull request. You can then merge the pull
   request into the `develop` branch. Make sure to use merge commits and not squash or rebase.
4. If there were updates to the `develop` branch while the pull request was in review, you will need to rebase your
   branch onto the `develop` branch again and resolve any conflicts. Make sure this is discussed with the reviewer.
5. After merging the pull request, the commit is automatically closed and the status is set to `Done`.

### Commits & Branches

For commits, we follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. The
commits are automatically checked by the [`Semantic PRs`](https://github.com/Ezard/semantic-prs) GitHub App when
creating a pull request.

A branch name should be `<prefix>/<issue-number>-<short-description>`, e.g. `fix/1234-fix-bug-in-component`. `prefix`
signals the type of the issue. For that we use the type of
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) that best fits the issues. For instance, if the
issue is a bug, we use `fix/`, if it is a feature, we use `feat/`, etc. **Prefer** using the GitHub functionality to
create branches from an issues as it already provides `<issue-number>-<short-description>` and you only have to add the
`prefix/` part.

## Project Layout

```plaintext
.
├── api/ (snowballr-api submodule)
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── composites/ (our components)
│   │   │   └── primitives/ (shadcn/ui components)
│   │   └── model/
│   │       └── api/ (auto-generated API code)
│   └── routes/ (website layout)
└── tests/
    ├── e2e/
    ├── integration/
    └── unit/
```

<!-- TODO: move testing to separate page; wait for PRs -->

## Testing

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

### Test Data

To use test data in the tests, you can either use the
[example data](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/example-data.ts) or the
[model builder](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/model-builder.ts).
In general, it makes sense to use the model builder to create test data, as it is more flexible and easier to use.

> **Note**: Do not expect that the example data never changes, so it is better to use the model builder and overwrite
> the values you need.

### Conventions

- For single test cases, we use the _when-then_ pattern, e.g. `test("When ..., then ...", () => { ... })`. This makes it
  easier to understand what the test is about and what happens under what conditions.
- We use the `describe` function to group tests that belong together, e.g. a function
  (`describe("foo()", () => { ... })`) or a component (`describe("MyComponent", () => { ... })`).

### Unit Tests

Unit tests are used to test individual functions or components in isolation. They are located in the
[tests/unit](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/unit) directory. Run them with:

```bash
npm run test:unit
```

### Integration Tests

Integration tests are used to test the interaction between different components or functions. They are located in the
[tests/integration](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/integration) directory.
Run them with:

```bash
npm run test:integration
```

The location of the tests should mirror the location of the components they are testing. For example, a test for a
component located at `src/lib/components/composites/group/MyComponent.svelte` should be located at
`tests/integration/group/MyComponent.test.ts`. To easily test components and user interaction, we use the
[testing-library](https://testing-library.com/docs/svelte-testing-library/intro) and
[user-event](https://testing-library.com/docs/ecosystem-user-event) packages. They provide a simple and intuitive way
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

### End-to-End Tests

End-to-End (E2E) tests verify the full functionality of the application in a realistic browser environment.
In this project, we use [Playwright](https://playwright.dev/) to implement and run E2E tests.
The tests are located in the [tests/e2e](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/e2e) directory
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

#### Requirements

The E2E tests require a mock backend to be running for each supported browser (Chromium, Firefox, and WebKit).
These mock backends simulate the backend responses.

To manually start all necessary mock backends, you can use the provided script, which will start one instance per
browser if you provide the three ports:

```bash
bash ./scripts/start_mock_backend.sh -c 3001 3002 3003
```

Each browser uses a different port for its mock backend. You can override the default ports
using the following environment variables:

| Variable                                     | Default (if the variable is not set) | Description                                                                            |
| -------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| `PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_CHROMIUM` | 3002                                 | The port that the mock backend will listen on for E2E testing of the chromium browser. |
| `PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_FIREFOX`  | 3003                                 | The port that the mock backend will listen on for E2E testing of the firefox browser.  |
| `PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_WEBKIT`   | 3004                                 | The port that the mock backend will listen on for E2E testing of the webkit browser.   |

#### Best Practices

1. **Use the test fixture**:
   Instead of importing the `test` fixture directly from "@playwright/test" directly,
   use the `test` variable exported from [`fixtures/general-fixture.ts`](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/e2e/fixtures/general-fixture.ts).
   This ensures that the API calls to the mock backend are automatically redirected to the correct mock backend
   based on the browser the test is running in.

   In general, it makes sense to create an own fixture, if you want to use an object in multiple tests or
   run a certain function before / after each test.

2. **Use Page Object Models (POMs)**:
   To make tests more maintainable and readable, use page object models (pom) to encapsulate UI logic.
   For example, the [`pom/create-project-dialog-model.ts`](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/e2e/pom/create-project-dialog-model.ts)
   file wraps a page with custom selectors and helper functions for the `CreateProjectDialog` component,
   improving clarity and reusability across tests. In particular, these _pom_s can be wrapped in a fixture
   so that they can be accessed directly in each test without having to create a separate \_pom_ in each test.

For more advanced usage and documentation, refer to the official [Playwright documentation](https://playwright.dev/).

## Lighthouse

We use Lighthouse to audit the performance, accessibility and best practices of our app.
To run a Lighthouse audit on the app, you can use the following command:

```bash
npm run lighthouse
```

To run all available routes, use:

```bash
npm run lighthouse:all
```

The report will be saved in the `./lighthouse-reports` directory. To automatically open the report in your browser,
you can use the `--view` flag:

```bash
npm run lighthouse -- --view
# or
npm run lighthouse:all -- --view
```

To only run a sub-route, you can use the `--dir` flag:

```bash
npm run lighthouse -- --dir=/settings
# or
npm run lighthouse:all -- --dir=/settings
```
