# SnowballR

**SnowballR** is a web-based tool supporting _Systematic Literature Reviews (SLR)_.

## SnowballR's use cases

![Open Use Cases](https://img.shields.io/github/issues-search?query=repo%3ASE-UUlm%2Fsnowballr-frontend%20is%3Aopen%20is%3Aissue%20label%3A%22use%20case%22%20&label=open)
![Closed Use Cases](https://img.shields.io/github/issues-search?query=repo%3ASE-UUlm%2Fsnowballr-frontend%20is%3Aclosed%20is%3Aissue%20label%3A%22use%20case%22%20&label=closed&color=green)

You can find all use cases
[here](https://github.com/SE-UUlm/snowballr-frontend/issues?q=is%3Aissue%20label%3A%22use%20case%22%20).

## Getting Started

The fastest way to get started is to use the provided Docker setup. To do so, clone this repository and run the following commands:

```bash
git clone git@github.com:SE-UUlm/snowballr-frontend.git
cd snowballr-frontend
docker-compose --profile run up
```

Be sure to have the environment variables set or create a `.env` file in the root directory of the project (see below).

To build the project from source, run the following commands:

```bash
git clone git@github.com:SE-UUlm/snowballr-frontend.git
cd snowballr-frontend
git submodule update --init --recursive
npm install
```

Next, generate the API code[^tag-checkout]:

```bash
npm run compile:proto
```

You can find the generated API code in the `src/lib/model/api` directory.

To run the app, you need to create a `.env` file in the root directory of the project.
The file should contain the following environment variables
(see [.env.example](https://github.com/SE-UUlm/snowballr-frontend/blob/develop/.env.example)
for an example or copy it using `cp .env.example .env`):

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

If you don't have a backend server running, you can use the mock backend.
Head over to the [snowballr-mock-backend](https://github.com/SE-UUlm/snowballr-mock-backend) repository and follow the
instructions there.

<!-- Links -->

[^tag-checkout]:
    Make sure, that the used API version was manually set to the desired stable version, otherwise set it
    (see [here](https://stackoverflow.com/questions/1777854/how-can-i-specify-a-branch-tag-when-adding-a-git-submodule/1778247#1778247)
    for further hints).
