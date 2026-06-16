The fastest way to get started is to use the provided Docker setup. To do so, run the following commands:

```bash
git clone git@github.com:SE-UUlm/snowballr-frontend.git
cd snowballr-frontend
docker compose up
```

Be sure to have the environment variables set or create a `.env` file in the root directory of the project (see
[below](#environment-variables)).

## Environment Variables

The app requires a set of environment variables to run. You can set them in a `.env` file in the root directory of the
project. Either create the file manually or copy the provided example:

```bash
cp .env.example .env
```

The environment variables are as follows:

| Variable                   |      Required      |    Default    | Description                                                                                                                       |
| -------------------------- | :----------------: | :-----------: | --------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLIC_API_BASE_URL`      | :white_check_mark: |       -       | The URL of the backend API.                                                                                                       |
| `PUBLIC_IS_DEV_MODE`       |        :x:         |     false     | Whether the app is in development mode. This may enable additional development tooling.                                           |
| `PUBLIC_CREDENTIAL_POLICY` |        :x:         | "same-origin" | When the credentials for the backend should be attached to the request. Possible values are "same-origin", "include", and "omit". |
| `PORT`                     |        :x:         |     4173      | The port where the frontend is served                                                                                             |

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
