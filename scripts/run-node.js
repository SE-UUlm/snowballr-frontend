// Since with Node 23 type stripping no longer has to be explicitly activated,
// but is standard and must be explicitly deactivated,
// this script checks whether node is running in version 23 and if so,
// type stripping is deactivated, since the generated GRPC client does not work with type stripping.

export const isNode23 = process.version.startsWith("v23");
export const NO_TYPE_STRIPPING_FLAG = "--no-experimental-strip-types";
