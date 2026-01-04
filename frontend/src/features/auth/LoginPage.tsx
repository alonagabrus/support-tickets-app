import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { authApi } from '../../api/authApi';

export const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/tickets', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);

        try {
            const response = await authApi.login({ username: username.trim(), password });
            localStorage.setItem('token', response.token);
            localStorage.setItem('username', response.username);
            navigate('/tickets', { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to login. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f7f5fa' }}>
            <div className="flex-1 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-center mb-6">Support Tickets System</h1>
                    <h2 className="text-xl font-semibold text-center mb-6">Login</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <TextInput
                            label="Username"
                            value={username}
                            onChange={setUsername}
                            placeholder="Enter username"
                            required
                            autoFocus
                        />

                        <TextInput
                            label="Password"
                            type="password"
                            value={password}
                            onChange={setPassword}
                            placeholder="Enter password"
                            required
                        />

                        {error && <ErrorMessage message={error} />}

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </div>
            </div>
            <footer className="app-footer">
                <div className="footer-content">
                    <p className="copyright-text">© Alona</p>
                </div>
            </footer>
        </div>
    );
};

