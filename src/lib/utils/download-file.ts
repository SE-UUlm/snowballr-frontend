/**
 * Offers a download of the given data with the specified filename.
 *
 * @param byteArray - the data to be downloaded
 * @param filename - the desired filename for the downloaded file
 */
export function downloadBlob(byteArray: Uint8Array<ArrayBufferLike>, filename: string): void {
    const normalizedData = new Uint8Array(byteArray);

    // create a browser Blob and object URL
    const file = new window.Blob([normalizedData], {
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

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
