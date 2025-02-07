# SnowballR

**SnowballR** is a web-based tool supporting _Systematic Literature Reviews (SLR)_.

## SnowballR's use cases

![Open Use Cases](https://img.shields.io/github/issues-search?query=repo%3ASE-UUlm%2Fsnowballr-frontend%20is%3Aopen%20is%3Aissue%20label%3A%22use%20case%22%20&label=open)
![GitHub issue custom search](https://img.shields.io/github/issues-search?query=repo%3ASE-UUlm%2Fsnowballr-frontend%20is%3Aclosed%20is%3Aissue%20label%3A%22use%20case%22%20&label=closed&color=green)

To keep track of the use cases we are working on, we are using the GitHub project board feature. You can find them [here](https://github.com/orgs/SE-UUlm/projects/2/views/7).

<!-- TODO: extend project description or link to wiki -->

## Getting Started

<!-- TODO: add prerequisites by trying to set up this repository in a clean environment -->

> **Note**: Currently it is only possible to build from source.

To get started clone this repository and install the dependencies:

```bash
git clone git@github.com:SE-UUlm/snowballr-frontend.git
cd snowballr-frontend
npm install
```

Next the API need to be integrated by initializing the corresponding submodule[^tag-checkout] and compile the
proto files containing the API specification:

```bash
git submodule update --init --recursive
npm run compile:proto
```

To run the app, you need to create a `.env` file in the root directory of the project. The file should contain the following environment variables (see [.env.example](./.env.example) for an example):

| Variable              | Description                 |
| --------------------- | --------------------------- |
| `PUBLIC_API_BASE_URL` | The URL of the backend API. |

After completing these steps, you can start a development server with:

```bash
npm run dev
```

or create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> **Note**: To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

[^tag-checkout]: The used API version need to be set manually to the desired stable version, e.g. by `cd api && git checkout v0.1.0`

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

### Unit Tests

Unit tests are used to test individual functions or components in isolation. They are located in the [tests/unit](./tests/unit/) directory. Run them with:

```bash
npm run test:unit
```

### Integration Tests

Integration tests are used to test the interaction between different components or functions. They are located in the [tests/integration](./tests/integration/) directory. Run them with:

```bash
npm run test:integration
```

### End-to-End Tests

End-to-end tests are used to test the functionality of the app as a whole. They are located in the [tests/e2e](./tests/e2e/) directory. Run them with:

```bash
npm run test:e2e
```

### Lighthouse

We use Lighthouse to audit the performance, accessibility and best practices of our app. To install Lighthouse, run:

```bash
npm install -g lighthouse
```

To run a Lighthouse audit on the app, you can use:

```bash
npm run lighthouse -- http://localhost:4173/path
```

The report will be saved in the `./lighthouse-reports` directory.
