import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function Login() {
    const { login } = useStore();
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState({ identifier: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');

    const fillDemo = (role: 'Admin' | 'Moderator' | 'User') => {
        if (role === 'Admin') setLoginData({ identifier: 'rakib@gmail.com', password: 'rakib' });
        else if (role === 'Moderator') setLoginData({ identifier: 'sohag@gmail.com', password: 'sohag' });
        else setLoginData({ identifier: 'alamin@gmail.com', password: 'alamin' });
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        if (!loginData.identifier || !loginData.password) {
            return setErrorMessage('Please fill in all fields.');
        }
        const result = login(loginData.identifier, loginData.password);
        if (result.success) {
            navigate('/overview');
        } else {
            setErrorMessage(result.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                        M
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">Megatools.io</h1>
                    <p className="text-slate-500 mt-2">Secure Login Portal</p>
                </div>
                
                {errorMessage && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-start gap-2 border border-red-100">
                        <i className="fas fa-exclamation-circle mt-0.5"></i>
                        <span>{errorMessage}</span>
                    </div>
                )}
                
                <div className="mb-4">
                    <p className="text-xs text-slate-400 font-medium mb-3 text-center">DEMO CREDENTIALS</p>
                    <div className="flex justify-center gap-3 flex-wrap">
                        <button onClick={() => fillDemo('Admin')} className="px-3 py-2 bg-slate-50 text-slate-600 text-xs rounded-lg border border-slate-200 hover:border-blue-300">Team Admin</button>
                        <button onClick={() => fillDemo('Moderator')} className="px-3 py-2 bg-slate-50 text-slate-600 text-xs rounded-lg border border-slate-200 hover:border-purple-300">Moderator</button>
                        <button onClick={() => fillDemo('User')} className="px-3 py-2 bg-slate-50 text-slate-600 text-xs rounded-lg border border-slate-200 hover:border-green-300">User</button>
                    </div>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email / Username</label>
                        <input type="text" value={loginData.identifier} onChange={e => setLoginData({...loginData, identifier: e.target.value})}
                               className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                               placeholder="admin@megatools.io" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input type="password" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})}
                               className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                               placeholder="••••••" required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                        Secure Login
                    </button>
                </form>
                
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400 font-medium mb-3">NEW USER?</p>
                    <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Registration by referral only
                    </a>
                </div>
            </div>
        </div>
    );
}