export default {
    extends: "lighthouse:default",
    settings: {
        formFactor: "desktop",
        screenEmulation: {
            mobile: false,
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            disabled: false,
        },
    },
};
