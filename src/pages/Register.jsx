import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register(name, email, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md p-8 border rounded-lg shadow-sm bg-card text-card-foreground">
                <h1 className="text-2xl font-bold mb-6 text-center">Join AXEL</h1>
                {error && <div className="bg-destructive/10 text-destructive p-3 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Display Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border rounded-md bg-transparent"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 border rounded-md bg-transparent"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-3 py-2 border rounded-md bg-transparent"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90">
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Log In</Link>
                </p>
            </div>
        </div>
    );
}
