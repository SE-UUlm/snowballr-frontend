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

## Testing

To test the functionality of our app we employ unit, integration and end-to-end tests. To run all tests at once you can use:

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
In general, it makes sense to use the model builder to create test data, as it is more flexible and easier to use. Note
that you should never expect that the example data never changes, so it is better to use the model builder and overwrite
the values you need.

### Conventions

- For single test cases, we use the when-then pattern, e.g. `test("When ..., Then ...", () => { ... })`. This makes it
  easier to understand what the test is about.
- We use the `describe` function to group tests that belong together, e.g. a function
  (`describe("foo()", () => { ... })`) or a component (`describe("MyComponent", () => { ... })`).

### Unit Tests

Unit tests are used to test individual functions or components in isolation. They are located in the
[tests/unit](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/unit/) directory. Run them with:

```bash
npm run test:unit
```

### Integration Tests

Integration tests are used to test the interaction between different components or functions. They are located in the
[tests/integration](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/integration/) directory.
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

End-to-end tests are used to test the functionality of the app as a whole. They are located in the
[tests/e2e](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/tests/e2e/) directory. Run them with:

```bash
npm run test:e2e
```

Additionally, you can configure the E2E tests by setting the following process environment variables:

| Variable                                     | Default (if the variable is not set) | Description                                                                            |
| -------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| `PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_CHROMIUM` | 3002                                 | The port that the mock backend will listen on for E2E testing of the chromium browser. |
| `PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_FIREFOX`  | 3003                                 | The port that the mock backend will listen on for E2E testing of the firefox browser.  |
| `PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_WEBKIT`   | 3004                                 | The port that the mock backend will listen on for E2E testing of the webkit browser.   |

## Lighthouse

We use Lighthouse to audit the performance, accessibility and best practices of our app. To install Lighthouse, run:

```bash
npm install -g lighthouse
```

To run a Lighthouse audit on the app, you can use (note we use the url of the preview server here):

```bash
npm run lighthouse -- http://localhost:4173/path
```

The report will be saved in the `./lighthouse-reports` directory.
