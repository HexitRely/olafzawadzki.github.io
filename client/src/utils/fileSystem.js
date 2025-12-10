export async function computeFileHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export async function scanDirectory(files) {
    const fileTree = {};

    // files is a FileList or array of File objects
    // Note: input webkitdirectory returns a flat list of files with webkitRelativePath

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Skip hidden files or system files if needed
        if (file.name.startsWith('.')) continue;

        const relativePath = file.webkitRelativePath || file.name;
        const hash = await computeFileHash(file);

        fileTree[relativePath] = {
            path: relativePath,
            hash,
            size: file.size,
            lastModified: file.lastModified,
            fileObj: file // Keep reference for uploading later
        };
    }

    return fileTree;
}

export function diffFileTrees(oldTree, newTree) {
    const changes = {
        added: [],
        modified: [],
        deleted: [],
        unchanged: []
    };

    const allPaths = new Set([...Object.keys(oldTree || {}), ...Object.keys(newTree || {})]);

    allPaths.forEach(path => {
        const oldFile = oldTree ? oldTree[path] : undefined;
        const newFile = newTree ? newTree[path] : undefined;

        if (!oldFile && newFile) {
            changes.added.push(newFile);
        } else if (oldFile && !newFile) {
            changes.deleted.push(oldFile);
        } else if (oldFile.hash !== newFile.hash) {
            changes.modified.push(newFile);
        } else {
            changes.unchanged.push(newFile);
        }
    });

    return changes;
}
