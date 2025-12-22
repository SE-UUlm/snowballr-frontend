The fastest way to get started is to use the provided Docker setup. To do so, run the following commands:

```bash
git clone git@github.com:SE-UUlm/snowballr-frontend.git
cd snowballr-frontend
docker compose up
```

Be sure to have the environment variables set or create a `.env` file in the root directory of the project (see
[below](#environment-variables)).

We provide several docker compose profiles for different setups. Without any arguments,
a standalone frontend is started. If you don't have a backend server running, you can use the other profiles, which
start a frontend that connects to the [snowballR mock backend](https://github.com/SE-UUlm/snowballr-mock-backend):

- `mock-local`: Starts the frontend and the mock backend in a local setup.
- `mock-public`: Starts the frontend with a connection to the deployed mock backend.

Use `docker compose --profile <profile> up` to start the frontend with the desired profile.

## Environment Variables

The app requires a set of environment variables to run. You can set them in a `.env` file in the root directory of the
project. Either create the file manually or copy the provided example:

```bash
cp .env.example .env
```

The environment variables are as follows:

| Variable                 |      Required      |    Default    | Description                                                                                                                       |
| ------------------------ | :----------------: | :-----------: | --------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLIC_API_BASE_URL`    | :white_check_mark: |       -       | The URL of the backend API.                                                                                                       |
| `PUBLIC_IS_DEV_MODE`     |        :x:         |     false     | Whether the app is in development mode. This may enable additional development tooling.                                           |
| `PUBLIC_CREDENTIAL_MODE` |        :x:         | "same-origin" | When the credentials for the backend should be attached to the request. Possible values are "same-origin", "include", and "omit". |
| `PORT`                   |       :x:\*        |     4173      | The port where the frontend is served                                                                                             |
| `GRPC_PORT`              |       :x:\*        |     3000      | The port of the mock backend where the native server is listening on                                                              |
| `GRPC_WEB_PORT`          |       :x:\*        |     3001      | The port of the mock backend where the gRPC web proxy is listening on                                                             |

\* only used when using the docker compose profiles.

## Building from Source

To build the project from source, run the following commands:

```bash
git clone git@github.com:SE-UUlm/snowballr-frontend.git
cd snowballr-frontend
npm install
```

You can find the generated API client code in the
[`src/lib/model/api`](https://github.com/SE-UUlm/snowballr-frontend/tree/develop/src/lib/model/api)
directory.

Now you're good to go! Start the development server with:

```bash
npm run dev
```

or create the production version:

```bash
npm run build
```

You can preview the production build with `npm run preview`.
