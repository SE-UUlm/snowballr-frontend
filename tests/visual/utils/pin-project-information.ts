import type { Page } from "@playwright/test";
import { Project_Information } from "$api/project";
import { Timestamp } from "$api/google/protobuf/timestamp";
import type { DockerMockBackend } from "$tests/e2e/utils/helper/mock-backend";

const MESSAGE_FRAME = 0x00;

/**
 * The mock backend sets a project's creation date and the start of its latest stage from its own
 * clock, which can't be frozen from the test. The dashboard shows these dates and derives further
 * values from them (days in stage, estimated remaining time), so the text and therefore the layout
 * would change every day.
 *
 * This intercepts `GetProjectInformation` responses and replaces both timestamps with fixed values.
 * It must be registered after `DockerMockBackend.setupRouting`, so that it takes precedence.
 *
 * @param page - the page whose requests are intercepted
 * @param mockBackend - the mock backend the request is forwarded to
 * @param dates - the fixed dates to report
 */
export async function pinProjectInformation(
    page: Page,
    mockBackend: DockerMockBackend,
    dates: { creationDate: Date; lastStageStarted: Date },
) {
    await page.route("**/snowballr.SnowballR/GetProjectInformation", async (route) => {
        const response = await route.fetch({
            url: `${mockBackend.endpoint}/snowballr.SnowballR/GetProjectInformation`,
        });
        const isText = (response.headers()["content-type"] ?? "").includes("grpc-web-text");
        const body = await response.body();
        const frames = parseFrames(isText ? decodeBase64Chunks(body.toString()) : body);

        const patched = frames.map(({ flag, data }) => {
            if (flag !== MESSAGE_FRAME) return { flag, data };
            const information = Project_Information.fromBinary(data);
            information.creationDate = Timestamp.fromDate(dates.creationDate);
            information.lastStageStarted = Timestamp.fromDate(dates.lastStageStarted);
            return { flag, data: Project_Information.toBinary(information) };
        });

        const newBody = serializeFrames(patched);
        await route.fulfill({
            response,
            body: isText ? newBody.toString("base64") : newBody,
        });
    });
}

type Frame = { flag: number; data: Uint8Array };

/** Splits a gRPC-Web body into its frames (1 byte flag, 4 bytes big-endian length, payload). */
function parseFrames(buffer: Buffer): Frame[] {
    const frames: Frame[] = [];
    let offset = 0;
    while (offset + 5 <= buffer.length) {
        const flag = buffer[offset];
        const length = buffer.readUInt32BE(offset + 1);
        frames.push({ flag, data: buffer.subarray(offset + 5, offset + 5 + length) });
        offset += 5 + length;
    }
    return frames;
}

function serializeFrames(frames: Frame[]): Buffer {
    return Buffer.concat(
        frames.flatMap(({ flag, data }) => {
            const header = Buffer.alloc(5);
            header[0] = flag;
            header.writeUInt32BE(data.length, 1);
            return [header, Buffer.from(data)];
        }),
    );
}

/** A grpc-web-text body may consist of several separately padded base64 chunks. */
function decodeBase64Chunks(text: string): Buffer {
    const chunks = text.trim().split(/(?<==)(?=[^=])/);
    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk, "base64")));
}
