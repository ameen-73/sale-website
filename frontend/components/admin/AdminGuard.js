import { useState, useEffect } from 'react';
import { useApp } from '../../hooks/useAppContext';

export default function AdminGuard({ children }) {
    const { addToast } = useApp();
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const isAuth = sessionStorage.getItem('aura_admin_auth') === 'true';
        if (isAuth) {
            setAuthenticated(true);
        }
        setChecking(false);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'Custom@lamp4332') {
            sessionStorage.setItem('aura_admin_auth', 'true');
            setAuthenticated(true);
            setError(false);
            addToast('Access granted. Welcome back, Admin.', 'success');
        } else {
            setError(true);
            addToast('Incorrect password', 'error');
            setPassword('');
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse space-y-4 text-center">
                    <div className="h-8 bg-gray-100 rounded w-48 mx-auto" />
                    <div className="h-10 bg-gray-100 rounded w-64 mx-auto" />
                </div>
            </div>
        );
    }

    if (!authenticated) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4 bg-white">
                <div className="max-w-md w-full p-8 border border-aura-border rounded-2xl shadow-sm text-center space-y-8 animate-zoom-in">
                    <div>
                        <p className="label-sm text-aura-muted mb-2">AURA</p>
                        <h1 className="text-2xl font-light text-aura-text">Administration Access</h1>
                        <p className="text-xs text-aura-muted mt-2">Please enter the security password to proceed</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError(false);
                                }}
                                placeholder="Enter admin password"
                                required
                                className={`w-full px-4 py-3 border rounded-xl text-center text-sm outline-none transition-colors ${
                                    error 
                                        ? 'border-red-500 focus:border-red-600 bg-red-50/30' 
                                        : 'border-aura-border focus:border-aura-text'
                                }`}
                            />
                            {error && (
                                <p className="text-red-500 text-xs mt-2 animate-fade-in">Incorrect password. Access denied.</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="btn-primary w-full py-3 text-sm font-medium rounded-xl transition-all duration-300"
                        >
                            Unlock Panel
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return children;
}
