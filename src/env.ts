import { defineEnvVars } from "@sveltejs/kit/env";

// Values are read when the app starts (not inlined at build time), so they can be configured at runtime,
// e.g. via the environment of the Docker container. See README.md for documentation of the variables.
export const variables = defineEnvVars({
    PUBLIC_API_BASE_URL: {
        public: true,
        description: "The URL of the backend API.",
    },
    PUBLIC_IS_DEV_MODE: {
        public: true,
        schema: (value) => value,
        description:
            "Whether the app is in development mode. This may enable additional development tooling.",
    },
    PUBLIC_CREDENTIAL_POLICY: {
        public: true,
        schema: (value) => value,
        description:
            'When the credentials for the backend should be attached to the request. Possible values are "same-origin", "include", and "omit".',
    },
});
