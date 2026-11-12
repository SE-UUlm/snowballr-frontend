// Modified version of the solution from this comment on github:timostamm/protobuf-ts:
// https://github.com/timostamm/protobuf-ts/issues/584#issuecomment-1735664168

import { RpcError, type RpcInterceptor } from "@protobuf-ts/runtime-rpc";

declare global {
    // Augment globalThis to include the devtools flag as boolean
    var __GRPCWEB_DEVTOOLS__: boolean | undefined;
}

const type = "__GRPCWEB_DEVTOOLS__";

export const grpcWebDevToolsInterceptor: RpcInterceptor = {
    interceptUnary(next, method, input, options) {
        const res = next(method, input, options);
        if (globalThis.__GRPCWEB_DEVTOOLS__) {
            const methodType = "unary";
            const methodName = `${method.service.typeName}/${method.name}`;
            const request = method.I.toJson(res.request);
            void res
                .then((value) => {
                    window.postMessage({
                        type,
                        method: methodName,
                        methodType,
                        request,
                        response: method.O.toJson(value.response),
                    });
                })
                .catch((e) => {
                    if (e instanceof RpcError) {
                        window.postMessage({
                            type,
                            method: methodName,
                            methodType,
                            request,
                            error: {
                                code: e.code,
                                message: e.message,
                            },
                        });
                    }
                });
        }
        return res;
    },
    interceptServerStreaming(next, method, input, options) {
        const res = next(method, input, options);
        if (globalThis.__GRPCWEB_DEVTOOLS__) {
            const methodName = `${method.service.typeName}/${method.name}`;
            const methodType = "server_streaming";
            window.postMessage({
                type,
                method: methodName,
                methodType,
                request: method.I.toJson(res.request),
            });
            res.responses.onMessage((value) => {
                window.postMessage({
                    type,
                    method: methodName,
                    methodType,
                    response: method.O.toJson(value),
                });
            });
            res.responses.onError((e) => {
                if (e instanceof RpcError) {
                    window.postMessage({
                        type,
                        method: methodName,
                        methodType,
                        error: {
                            code: e.code,
                            message: e.message,
                        },
                    });
                }
            });
            res.responses.onComplete(() => {
                window.postMessage({
                    type,
                    method: methodName,
                    methodType,
                    response: "EOF",
                });
            });
        }
        return res;
    },
};
