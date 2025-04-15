The fastest way to get started is to use the provided Docker setup. To do so, run the following commands:

```bash
git clone git@github.com:SE-UUlm/snowballr-frontend.git
cd snowballr-frontend
git submodule update --init --recursive
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

| Variable              |      Required      | Default | Description                                                                             |
| --------------------- | :----------------: | :-----: | --------------------------------------------------------------------------------------- |
| `PUBLIC_API_BASE_URL` | :white_check_mark: |    -    | The URL of the backend API.                                                             |
| `PUBLIC_IS_DEV_MODE`  |        :x:         |  false  | Whether the app is in development mode. This may enable additional development tooling. |
| `PORT`                |       :x:\*        |  4173   | The port where the frontend is served                                                   |
| `GRPC_PORT`           |       :x:\*        |  3000   | The port of the mock backend where the native server is listening on                    |
| `GRPC_WEB_PORT`       |       :x:\*        |  3001   | The port of the mock backend where the gRPC web proxy is listening on                   |

\* only used when using the docker compose profiles.

## Building from Source

To build the project from source, run the following commands:

```bash
git clone git@github.com:SE-UUlm/snowballr-frontend.git
cd snowballr-frontend
git submodule update --init --recursive
npm install
```

Next, generate the API code [[1](#footnote-1)]:

```bash
npm run compile:proto
```

You can find the generated API code in the
[`src/lib/model/api`](https://github.com/SE-UUlm/snowballr-frontend/tree/af9ba337b6b40a3d573b62d420153763920e8481/src/lib/model/api)
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

<!-- markdownlint-disable MD033 -->

<a name="footnote-1">[1]</a> Make sure, that the used API version was manually set to the desired stable version,
otherwise set it (see
[here](https://stackoverflow.com/questions/1777854/how-can-i-specify-a-branch-tag-when-adding-a-git-submodule/1778247#1778247)
for further hints).

<!-- markdownlint-enable MD033 -->
