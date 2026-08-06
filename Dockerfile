# syntax=docker/dockerfile:1

# Keep in sync with .nvmrc
ARG NODE_VERSION=24

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine AS base

# Set working directory for all build stages.
WORKDIR /usr/src/app

################################################################################
# Create a stage for installing production dependencies.
FROM base AS build

# Create the directory for the generated API code
RUN mkdir -p src/lib/model/api/

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the source files into the image.
COPY . .
# We need to pass a sample base API URL so that the server can be built.
# The actual variable will be passed at runtime.
RUN echo 'PUBLIC_API_BASE_URL=http://localhost:8080' > .env
# Run the build script.
RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base AS final

# Use production node environment by default.
ENV NODE_ENV=production

# Default to including credentials with every request
ENV PUBLIC_CREDENTIAL_POLICY=include

# Copy env variables to file so that it can be read by svelte
RUN printenv | sed -n '/^PUBLIC_API_BASE_URL=/p;' > .env

# Run the application as a non-root user.
USER node

# Copy package.json so that package manager commands can be used.
COPY package.json .

# Copy the built application from the build stage into the image.
COPY --from=build /usr/src/app/build ./build

# Run the application.
CMD ["node", "--env-file=.env", "build"]
