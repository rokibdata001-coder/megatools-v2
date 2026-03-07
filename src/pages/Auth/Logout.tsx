import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function Logout() {
    const { logout } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        logout();
        navigate('/login');
    }, [logout, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in text-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                    M
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Logging out...</h1>
                <p className="text-slate-500">Please wait while we securely log you out.</p>
                <div className="mt-6 flex justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    );
}