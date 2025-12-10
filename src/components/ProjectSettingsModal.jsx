import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, UserPlus, Save, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectSettingsModal({ project, onClose, onUpdate }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || '');
    const [cloudLink, setCloudLink] = useState(project.cloud_link || '');
    const [inviteEmail, setInviteEmail] = useState('');
    const [collaborators, setCollaborators] = useState(project.collaborators || []);

    const isOwner = project.owner_email === user.email;

    const handleSaveGeneral = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3002/api/projects/${project.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': user.email
                },
                body: JSON.stringify({ name, description, cloud_link: cloudLink })
            });
            const updated = await res.json();
            onUpdate(updated);
            alert('Settings saved');
        } catch (err) {
            console.error(err);
            alert('Failed to save settings');
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3002/api/projects/${project.id}/collaborators`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': user.email
                },
                body: JSON.stringify({ email: inviteEmail })
            });
            const data = await res.json();
            setCollaborators(data.collaborators);
            setInviteEmail('');
        } catch (err) {
            console.error(err);
            alert('Failed to invite user');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
        try {
            await fetch(`http://localhost:3002/api/projects/${project.id}`, {
                method: 'DELETE',
                headers: { 'x-user-email': user.email }
            });
            navigate('/');
        } catch (err) {
            console.error(err);
            alert('Failed to delete project');
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card w-full max-w-2xl rounded-lg shadow-xl border flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Project Settings</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent hover:bg-secondary/50'}`}
                    >
                        General
                    </button>
                    {isOwner && (
                        <button
                            onClick={() => setActiveTab('collab')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'collab' ? 'border-primary text-primary' : 'border-transparent hover:bg-secondary/50'}`}
                        >
                            Collaborators
                        </button>
                    )}
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'general' && (
                        <form onSubmit={handleSaveGeneral} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Project Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    disabled={!isOwner}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md h-32 resize-none"
                                    placeholder="Add important project notes, key info, or goals..."
                                    disabled={!isOwner}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cloud Storage Link (Shared Folder)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={cloudLink}
                                        onChange={e => setCloudLink(e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-md"
                                        placeholder="https://drive.google.com/drive/folders/..."
                                        disabled={!isOwner}
                                    />
                                    {cloudLink && (
                                        <a href={cloudLink} target="_blank" rel="noreferrer" className="px-3 py-2 border rounded-md hover:bg-secondary flex items-center justify-center">
                                            <ExternalLink size={16} />
                                        </a>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Link to the Google Drive/Dropbox folder where this project's files are stored.
                                </p>
                            </div>

                            {isOwner && (
                                <div className="pt-6 border-t flex justify-between items-center">
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="text-destructive hover:bg-destructive/10 px-4 py-2 rounded-md flex items-center gap-2 text-sm"
                                    >
                                        <Trash2 size={16} /> Delete Project
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2"
                                    >
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            )}
                        </form>
                    )}

                    {activeTab === 'collab' && (
                        <div className="space-y-6">
                            <form onSubmit={handleInvite} className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Invite Collaborator</label>
                                    <input
                                        type="email"
                                        placeholder="user@example.com"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
                                    <UserPlus size={16} /> Invite
                                </button>
                            </form>

                            <div>
                                <h3 className="font-medium mb-3">Current Team</h3>
                                <div className="space-y-2">
                                    <div className="p-3 border rounded-md flex justify-between items-center bg-secondary/20">
                                        <span>{project.owner_email}</span>
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">OWNER</span>
                                    </div>
                                    {collaborators.map(email => (
                                        <div key={email} className="p-3 border rounded-md flex justify-between items-center">
                                            <span>{email}</span>
                                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">COLLABORATOR</span>
                                        </div>
                                    ))}
                                    {collaborators.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No collaborators invited yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
