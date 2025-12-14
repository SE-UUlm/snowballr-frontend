<div align="center">
    <picture>
        <img alt="SnowballR Logo" src="images/snowballr-logo-with-text.png" width="700"/>
    </picture>
</div>

<div align="center">
    <a href="https://github.com/SE-UUlm/snowballr-frontend/releases/latest">
        <!-- TODO: Enable once we have a release
        <img alt="Version" src="https://img.shields.io/github/v/release/SE-UUlm/snowballr-frontend?label=Version&color=light-green">
        -->
        <img alt="Version" src="https://img.shields.io/badge/Version-Not%20Releases%20Yet-red">
    </a>
    <a href="https://github.com/SE-UUlm/snowballr-frontend/actions/workflows/code_quality_checks.yml">
        <img alt="Code Quality Workflow Status" src="https://img.shields.io/github/actions/workflow/status/SE-UUlm/snowballr-frontend/code_quality_checks.yml?logo=github&label=Code%20Quality">
    </a>
    <a href="https://snowballr.informatik.uni-ulm.de">
        <img alt="Production Website" src="https://custom-icon-badges.demolab.com/badge/Production_Website-gray?logo=snowballr">
    </a>
    <a href="https://snowballr-dev.informatik.uni-ulm.de">
        <img alt="Development Website" src="https://custom-icon-badges.demolab.com/badge/Development_Website-gray?logo=snowballr">
    </a>
    <a href="https://github.com/SE-UUlm/snowballr-frontend/pkgs/container/snowballr-frontend">
        <img alt="Docker" src="https://img.shields.io/badge/Docker-ghcr.io-blue">
    </a>
    <a href="https://github.com/SE-UUlm/snowballr-frontend/wiki">
        <img alt="GitHub Wiki" src="https://img.shields.io/badge/Wiki-grey?logo=github">
    </a>
    <a href="https://deepwiki.com/SE-UUlm/snowballr-frontend">
        <img alt="Ask DeepWiki" src="https://deepwiki.com/badge.svg">
    </a>
    <a href="https://github.com/SE-UUlm/snowballr-frontend/blob/main/LICENSE">
        <img alt="License" src="https://img.shields.io/github/license/SE-UUlm/snowballr-frontend?label=License">
    </a>
</div>

# SnowballR Frontend

**SnowballR** is a web-based tool supporting _Systematic Literature Reviews (SLR)_.

## SnowballR's use cases

![Open Use Cases](https://img.shields.io/github/issues-search?query=repo%3ASE-UUlm%2Fsnowballr-frontend%20is%3Aopen%20is%3Aissue%20label%3A%22use%20case%22%20&label=open)
![Closed Use Cases](https://img.shields.io/github/issues-search?query=repo%3ASE-UUlm%2Fsnowballr-frontend%20is%3Aclosed%20is%3Aissue%20label%3A%22use%20case%22%20&label=closed&color=green)

You can find all use cases
[here](https://github.com/SE-UUlm/snowballr-frontend/issues?q=is%3Aissue%20label%3A%22use%20case%22%20).

## Getting Started

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

### Environment Variables

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

### Building from Source

See [our wiki](https://github.com/SE-UUlm/snowballr-frontend/wiki/Getting-Started) to build the project from source.
