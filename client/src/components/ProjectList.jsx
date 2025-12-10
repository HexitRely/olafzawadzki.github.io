import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Music, Clock, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { user, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3002/api/projects', {
            headers: { 'x-user-email': user.email }
        })
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                setIsLoading(false);
            })
            .catch(err => console.error(err));
    }, [user]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        try {
            const res = await fetch('http://localhost:3002/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': user.email
                },
                body: JSON.stringify({
                    name: newProjectName,
                    description: newProjectDesc,
                    bpm: 120,
                    musical_key: 'C Maj'
                })
            });
            const newProject = await res.json();
            setProjects([newProject, ...projects]);
            setNewProjectName('');
            setNewProjectDesc('');
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header Bar */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b">
                <h1 className="text-3xl font-bold tracking-tight">AXEL</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <User size={16} />
                        {user.name}
                    </div>
                    <button onClick={logout} className="text-xs border px-2 py-1 rounded hover:bg-secondary flex items-center gap-1">
                        <LogOut size={12} /> Logout
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">My Projects</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
                    <Plus size={16} /> New Project
                </button>
            </div>

            {isLoading ? (
                <p>Loading projects...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(project => (
                        <Link key={project.id} to={`/project/${project.id}`} className="block group">
                            <div className="border rounded-lg p-6 hover:shadow-lg transition-all bg-card text-card-foreground h-full flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2 rounded-full ${project.owner_email === user.email ? 'bg-secondary' : 'bg-blue-100 text-blue-600'}`}>
                                        <Music size={24} className={project.owner_email === user.email ? 'text-primary' : 'text-blue-600'} />
                                    </div>
                                    {project.owner_email !== user.email && (
                                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">SHARED</span>
                                    )}
                                </div>
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description || 'No description'}</p>

                                <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>{new Date(project.created_at || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        Open Workspace &rarr;
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {projects.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-secondary/20 rounded-lg border-dashed border-2">
                            No projects found. Create one to get started.
                        </div>
                    )}
                </div>
            )}

            {/* New Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-card w-full max-w-md p-6 rounded-lg shadow-xl border">
                        <h3 className="text-xl font-bold mb-4">Create New Project</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Project Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Summer Hits 2025"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                                <textarea
                                    placeholder="Genre, mood, or notes..."
                                    value={newProjectDesc}
                                    onChange={(e) => setNewProjectDesc(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md h-24 resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
