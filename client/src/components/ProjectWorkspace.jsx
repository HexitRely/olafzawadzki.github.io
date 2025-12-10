import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, FolderOpen, History, Loader2, Settings, ExternalLink, Download } from 'lucide-react';
import { scanDirectory, diffFileTrees } from '../utils/fileSystem';
import { generateChangePackage } from '../utils/zipper';
import { useAuth } from '../context/AuthContext';
import ProjectSettingsModal from './ProjectSettingsModal';

export default function ProjectWorkspace() {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [snapshots, setSnapshots] = useState([]);
    const [currentFileTree, setCurrentFileTree] = useState(null); // The tree from local scan
    const [activeSnapshot, setActiveSnapshot] = useState(null); // The snapshot we are comparing against (usually latest)
    const [diff, setDiff] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    // Commit State
    const [commitMessage, setCommitMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    // File Input Ref
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadProjectData();
    }, [id]);

    const loadProjectData = () => {
        fetch(`http://localhost:3002/api/projects/${id}`, {
            headers: { 'x-user-email': user.email }
        })
            .then(res => res.json())
            .then(data => {
                setProject(data.project);
                setSnapshots(data.snapshots);
                if (data.snapshots.length > 0) {
                    // Default to latest snapshot
                    setActiveSnapshot(data.snapshots[0]);
                }
            })
            .catch(err => console.error(err));
    };

    const handleDirectorySelect = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsScanning(true);
        try {
            const tree = await scanDirectory(files);
            setCurrentFileTree(tree);

            // Compute diff immediately if we have a base snapshot
            if (activeSnapshot) {
                const changes = diffFileTrees(activeSnapshot.file_tree || {}, tree);
                setDiff(changes);
            } else {
                // No previous snapshots, everything is "added" or just "unchanged" relative to empty?
                // Treat everything as Added
                const changes = diffFileTrees({}, tree);
                setDiff(changes);
            }
        } catch (err) {
            console.error(err);
            alert('Error scanning directory');
        } finally {
            setIsScanning(false);
        }
    };

    const handleDownloadZip = async () => {
        if (!diff || !project) return;
        const zipBlob = await generateChangePackage(diff, currentFileTree);
        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AXEL_Diff_${project.name}_${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleCommit = async () => {
        if (!diff || !project) return;
        if (!commitMessage.trim()) return alert('Please enter a commit message');

        try {
            const parentId = activeSnapshot ? activeSnapshot.id : null;

            // Use project cloud link as the only source
            const finalLink = project.cloud_link;

            const snapRes = await fetch('http://localhost:3002/api/snapshots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': user.email
                },
                body: JSON.stringify({
                    project_id: project.id,
                    parent_id: parentId,
                    message: commitMessage,
                    file_tree: currentFileTree,
                    external_link: finalLink
                })
            });

            await snapRes.json();

            alert(`Snapshot Created!`);
            setCommitMessage('');
            loadProjectData(); // Refresh history

        } catch (err) {
            console.error(err);
            alert('Commit failed: ' + err.message);
        }
    };

    if (!project) return <div>Loading...</div>;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b bg-card p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-secondary rounded-full"><ArrowLeft /></Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {project.name}
                            <button onClick={() => setShowSettings(true)} className="text-muted-foreground hover:text-foreground">
                                <Settings size={18} />
                            </button>
                        </h1>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-md" title={project.description}>
                            {project.description || 'No description'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {project.cloud_link && (
                        <a
                            href={project.cloud_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-md hover:bg-blue-100"
                        >
                            <ExternalLink size={16} /> Open Drive
                        </a>
                    )}

                    {/* Folder Input - Hidden but triggered via label or button */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        webkitdirectory=""
                        directory=""
                        onChange={handleDirectorySelect}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="flex items-center gap-2 border px-4 py-2 rounded-md hover:bg-secondary">
                        <FolderOpen size={16} />
                        {currentFileTree ? 'Rescan Folder' : 'Select Local Folder'}
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex">
                {/* Left Sidebar: History */}
                <div className="w-80 border-r bg-secondary/10 overflow-auto p-4">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <History size={16} /> History
                    </h2>
                    <div className="space-y-4">
                        {snapshots.map(snap => (
                            <div key={snap.id} className={`p-4 rounded-md border text-sm ${activeSnapshot?.id === snap.id ? 'bg-primary/5 border-primary' : 'bg-card'}`}>
                                <p className="font-medium">{snap.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{new Date(snap.timestamp).toLocaleString()}</p>
                                <div className="mt-2 text-xs flex gap-2">
                                    {snap.external_link ? (
                                        <a
                                            href={snap.external_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1"
                                        >
                                            <ExternalLink size={12} /> View Files
                                        </a>
                                    ) : snap.archive_file ? (
                                        <a
                                            href={`http://localhost:3002/storage/${snap.archive_file}`}
                                            download
                                            className="text-primary hover:underline"
                                        >
                                            Download Legacy
                                        </a>
                                    ) : (
                                        <span className="text-muted-foreground">No Package</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {snapshots.length === 0 && <p className="text-muted-foreground text-sm">No snapshots yet.</p>}
                    </div>
                </div>

                {/* Main Content: Diff View */}
                <div className="flex-1 p-8 overflow-auto">
                    {isScanning ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <p>Scanning Files & Computing Hashes...</p>
                        </div>
                    ) : !currentFileTree ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <FolderOpen size={48} className="mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No Folder Selected</h3>
                            <p>Select your local project folder to start tracking changes.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex flex-col gap-4 mb-6 p-4 border rounded-lg bg-card">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">Ready to Commit</h2>
                                    <button
                                        onClick={handleDownloadZip}
                                        disabled={!diff || (diff.added.length + diff.modified.length + diff.deleted.length === 0)}
                                        className="text-sm flex items-center gap-2 hover:underline disabled:opacity-50"
                                    >
                                        <Download size={14} /> Download Change Package (ZIP)
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Commit Message (e.g., Added drums)"
                                            className="w-full border px-3 py-2 rounded-md"
                                            value={commitMessage}
                                            onChange={(e) => setCommitMessage(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={handleCommit}
                                        disabled={!diff || (diff.added.length + diff.modified.length + diff.deleted.length === 0)}
                                        className="bg-primary text-primary-foreground px-6 rounded-md flex items-center gap-2 disabled:opacity-50 font-medium whitespace-nowrap"
                                    >
                                        <Save size={18} /> Commit
                                    </button>
                                </div>
                            </div>

                            {diff && (
                                <div className="space-y-6">
                                    {/* Stats */}
                                    <div className="grid grid-cols-4 gap-4 mb-8">
                                        <StatCard label="Added" count={diff.added.length} color="text-green-600" />
                                        <StatCard label="Modified" count={diff.modified.length} color="text-orange-600" />
                                        <StatCard label="Deleted" count={diff.deleted.length} color="text-red-600" />
                                        <StatCard label="Unchanged" count={diff.unchanged.length} color="text-gray-400" />
                                    </div>

                                    {/* File List */}
                                    <div className="border rounded-lg overflow-hidden">
                                        <FileList files={diff.added} type="added" icon="+" color="bg-green-500/10 text-green-700" />
                                        <FileList files={diff.modified} type="modified" icon="M" color="bg-orange-500/10 text-orange-700" />
                                        <FileList files={diff.deleted} type="deleted" icon="-" color="bg-red-500/10 text-red-700" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            {showSettings && (
                <ProjectSettingsModal
                    project={project}
                    onClose={() => setShowSettings(false)}
                    onUpdate={(updated) => {
                        setProject(updated);
                    }}
                />
            )}
        </div>
    );
}

function StatCard({ label, count, color }) {
    return (
        <div className="border rounded-md p-4 bg-card text-center">
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        </div>
    );
}

function FileList({ files, type, icon, color }) {
    if (files.length === 0) return null;
    return (
        <div>
            {files.map(f => (
                <div key={f.path} className={`px-4 py-2 border-b last:border-0 flex items-center gap-3 font-mono text-sm ${color}`}>
                    <span className="font-bold w-4 text-center">{icon}</span>
                    <span className="flex-1">{f.path}</span>
                    <span className="opacity-70 text-xs">{(f.size / 1024).toFixed(1)} KB</span>
                </div>
            ))}
        </div>
    );
}
