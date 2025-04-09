> **Note**: Currently it is only possible to build from source.

To build the project from source, run the following commands:

```bash
git clone git@github.com:SE-UUlm/snowballr-frontend.git
cd snowballr-frontend
git submodule update --init --recursive
npm install
```

Next, generate the API code:

```bash
npm run compile:proto
```

You can find the generated API code in the `src/lib/model/api` directory.

To run the app, you need to create a `.env` file in the root directory of the project. The file should contain the
following environment variables (see
[.env.example](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/.env.example) for an example or copy it using
`cp .env.example .env`):

| Variable              |      Required      | Default | Description                                                                             |
| --------------------- | :----------------: | :-----: | --------------------------------------------------------------------------------------- |
| `PUBLIC_API_BASE_URL` | :white_check_mark: |    -    | The URL of the backend API.                                                             |
| `PUBLIC_IS_DEV_MODE`  |        :x:         |  false  | Whether the app is in development mode. This may enable additional development tooling. |

Now you're good to go! Start the development server with:

```bash
npm run dev
```

or create the production version:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

If you don't have a backend server running, you can use the mock backend. Head over to the
[snowballr-mock-backend](https://github.com/SE-UUlm/snowballr-mock-backend) repository and follow the instructions there.
