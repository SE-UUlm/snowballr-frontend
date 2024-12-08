# SnowballR Frontend

Frontend of the SnowballR project.

## Use Cases

To keep track of the use cases we are working on, we are using the GitHub project board feature. You can find them [here](https://github.com/orgs/SE-UUlm/projects/2/views/7).

## Environment Variables

To run the app, you need to create a `.env` file in the root directory of the project. The file should contain the following environment variables (see [.env.example](./.env.example) for an example):

| Variable              | Description                 |
| --------------------- | --------------------------- |
| `PUBLIC_API_BASE_URL` | The URL of the backend API. |

## Developing

Once you've installed dependencies with `npm install`, start a development server:

```bash
npm run dev
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Testing

To test the functionality of our app we employ unit, integration and end-to-end tests. To run all tests at once you can use:

```bash
npm run test
```

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
