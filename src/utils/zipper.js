import JSZip from 'jszip';

export async function generateChangePackage(changes, allFilesMap) {
    const zip = new JSZip();
    const manifest = {
        timestamp: new Date().toISOString(),
        changes: {
            added: changes.added.map(f => f.path),
            modified: changes.modified.map(f => f.path),
            deleted: changes.deleted.map(f => f.path)
        }
    };

    // Add manifest
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));

    // Add added/modified files
    const filesToPack = [...changes.added, ...changes.modified];

    filesToPack.forEach(fileData => {
        // fileData.fileObj is the original File object
        if (fileData.fileObj) {
            zip.file(fileData.path, fileData.fileObj);
        }
    });

    const content = await zip.generateAsync({ type: "blob" });
    return content;
}
