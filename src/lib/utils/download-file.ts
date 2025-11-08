import { Blob } from "$lib/model/api/base";

/**
 * Offers a download of the given blob with the specified filename.
 *
 * @param blob - the blob to download
 * @param filename - the desired filename for the downloaded file
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const normalizedData = new Uint8Array(blob.data);

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
