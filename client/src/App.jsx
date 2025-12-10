import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProjectList from './components/ProjectList';
import ProjectWorkspace from './components/ProjectWorkspace';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return children;
}

function AppContent() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
                <ProtectedRoute>
                    <ProjectList />
                </ProtectedRoute>
            } />
            <Route path="/project/:id" element={
                <ProtectedRoute>
                    <ProjectWorkspace />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-background text-foreground antialiased font-sans">
                    <AppContent />
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
