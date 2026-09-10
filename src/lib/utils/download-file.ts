/**
 * Offers a download of the given data with the specified filename.
 *
 * @param byteArray - the data to be downloaded
 * @param filename - the desired filename for the downloaded file
 */
export function downloadBlob(byteArray: Uint8Array<ArrayBufferLike>, filename: string): void {
    // copy into an ArrayBuffer-backed view, since Blob does not accept SharedArrayBuffer-backed data
    const bytes = new Uint8Array(byteArray);

    // create a browser Blob and object URL
    const file = new globalThis.Blob([bytes], {
        type: "application/octet-stream",
    });
    const url = URL.createObjectURL(file);

    // trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    a.remove();
    URL.revokeObjectURL(url);
}
