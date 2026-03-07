import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';

export default function Signup() {
    const { register } = useStore();
    const navigate = useNavigate();
    const { ref } = useParams();
  console.log("Ref from URL:", ref);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [newUserData, setNewUserData] = useState<any>(null);
    const [regData, setRegData] = useState({
        username: '',
        email: '',
        phone: '',
        facebook: '',
        password: '',
        confirm_password: ''
    });

    useEffect(() => {
        if (!ref) {
            navigate('/login');
        }
    }, [ref, navigate]);

    const validateUsername = (username: string) => {
        if (/\s/.test(username) || username.includes('.')) return 'Username cannot contain spaces or dots.';
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores.';
        if (username.length > 10) return 'Username cannot exceed 10 characters.';
        if (username.length < 3) return 'Username must be at least 3 characters.';
        return null;
    };

    const validatePhone = (phone: string) => {
        const cleanPhone = phone.replace(/\s+/g, '');
        if (!/^(\+8801|01)[0-9]{9}$/.test(cleanPhone)) return 'Please enter a valid Bangladeshi phone number.';
        const prefix = cleanPhone.slice(-11, -8);
        const validPrefixes = ['017', '018', '019', '016', '015', '013', '014'];
        if (!validPrefixes.includes(prefix)) return 'Please enter a valid Bangladeshi mobile number.';
        return null;
    };

    const validateFacebook = (url: string) => {
        try {
            const urlObj = new URL(url);
            const host = urlObj.hostname.toLowerCase();
            if (!['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.com', 'www.fb.com'].includes(host)) {
                return 'Please enter a valid Facebook profile URL.';
            }
            if (!urlObj.pathname || urlObj.pathname === '/') {
                return 'Please enter a complete Facebook profile URL.';
            }
        } catch {
            return 'Please enter a valid Facebook profile URL.';
        }
        return null;
    };

    const validateEmail = (email: string) => {
        if (!email.toLowerCase().endsWith('@gmail.com')) return 'Only Gmail addresses are allowed.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
        return null;
    };

    const validatePassword = (password: string) => {
        if (password.length < 6) return 'Password must be at least 6 characters.';
        return null;
    };

    const formatPhone = (value: string) => {
        let numbers = value.replace(/\D/g, '');
        if (numbers.startsWith('880')) {
            numbers = numbers;
        } else if (numbers.startsWith('01')) {
            numbers = '88' + numbers;
        } else if (numbers.length > 0 && !numbers.startsWith('88')) {
            numbers = '8801' + numbers;
        }
        if (numbers.length >= 11) {
            return '+880 ' + numbers.substring(3, 6) + ' ' + numbers.substring(6, 9) + ' ' + numbers.substring(9, 13);
        }
        return value;
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const usernameError = validateUsername(regData.username);
        if (usernameError) return setErrorMessage(usernameError);

        const phoneError = validatePhone(regData.phone);
        if (phoneError) return setErrorMessage(phoneError);

        const facebookError = validateFacebook(regData.facebook);
        if (facebookError) return setErrorMessage(facebookError);

        const emailError = validateEmail(regData.email);
        if (emailError) return setErrorMessage(emailError);

        const passwordError = validatePassword(regData.password);
        if (passwordError) return setErrorMessage(passwordError);

        if (regData.password !== regData.confirm_password) {
            return setErrorMessage('Passwords do not match.');
        }

        const registrationData = {
            ...regData,
            referral_code: ref || ''
        };

        const result = register(registrationData);
        if (result.success) {
            setNewUserData({
                email: regData.email,
                password: regData.password,
                username: regData.username,
                role: result.user.role,
                status: 'Pending'
            });
            setSuccessMessage('Registration successful!');
        } else {
            setErrorMessage(result.message || 'Registration failed');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const copyAllInfo = () => {
        if (!newUserData) return;
        const loginLink = `${window.location.origin}/${newUserData.username}/login`;
        const content = `Megatools.io Account Information\n\nLogin Link: ${loginLink}\nEmail: ${newUserData.email}\nPassword: ${newUserData.password}\n\nStatus: Pending Approval`;
        navigator.clipboard.writeText(content);
    };

    const downloadAccountInfo = () => {
        if (!newUserData) return;
        const loginLink = `${window.location.origin}/${newUserData.username}/login`;
        const content = `Megatools.io Account Credentials
=======================================

Login Link: ${loginLink}

Email: ${newUserData.email}

Password: ${newUserData.password}

Status: Pending Approval
Role: ${newUserData.role}

IMPORTANT:
- Save this information securely
- Do not share your password
- Account requires administrator approval
- Login will be available after approval

Generated: ${new Date().toLocaleString()}`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `megatools-${newUserData.email.split('@')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (successMessage && newUserData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto flex items-center justify-center text-white mb-4 shadow-lg">
                            <i className="fas fa-check text-3xl"></i>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Registration Successful!</h1>
                        <p className="text-slate-600">Your account has been created successfully</p>
                    </div>

                    <div className="px-10 space-y-4 mb-8">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <i className="fas fa-link text-blue-600"></i>
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800">Login Link</div>
                                            <div className="text-slate-500 text-sm">Access your account using this link</div>
                                        </div>
                                    </div>
                                    <div className="font-mono text-sm text-blue-600 bg-blue-50 p-3 rounded-lg mt-2">
                                        {window.location.origin}/{newUserData.username}/login
                                    </div>
                                </div>
                                <button onClick={() => copyToClipboard(`${window.location.origin}/${newUserData.username}/login`)} 
                                        className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap">
                                    <i className="fas fa-copy"></i> Copy
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <i className="fas fa-envelope text-blue-600"></i>
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800">Email Address</div>
                                            <div className="text-slate-500 text-sm">Your registered email</div>
                                        </div>
                                    </div>
                                    <div className="font-medium text-lg text-slate-800 bg-blue-50 p-3 rounded-lg mt-2">
                                        {newUserData.email}
                                    </div>
                                </div>
                                <button onClick={() => copyToClipboard(newUserData.email)} 
                                        className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap">
                                    <i className="fas fa-copy"></i> Copy
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <i className="fas fa-lock text-blue-600"></i>
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800">Password</div>
                                            <div className="text-slate-500 text-sm">Keep this password secure</div>
                                        </div>
                                    </div>
                                    <div className="font-mono text-lg font-medium text-slate-800 bg-blue-50 p-3 rounded-lg mt-2 text-center tracking-wider">
                                        {newUserData.password}
                                    </div>
                                </div>
                                <button onClick={() => copyToClipboard(newUserData.password)} 
                                        className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap">
                                    <i className="fas fa-copy"></i> Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mx-10 mb-8">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <i className="fas fa-clock text-amber-600"></i>
                                <div>
                                    <div className="font-medium text-amber-800 mb-1">Account Status: Pending Approval</div>
                                    <div className="text-sm text-amber-700">Your account is under review. You can login after administrator approval.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 px-10 pb-8">
                        <button onClick={downloadAccountInfo} 
                                className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium">
                            <i className="fas fa-download"></i> Download All
                        </button>
                        <button onClick={copyAllInfo} 
                                className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-medium">
                            <i className="fas fa-copy"></i> Copy All
                        </button>
                    </div>

                    <div className="py-6 border-t border-slate-200 mx-10 text-center">
                        <p className="text-sm text-slate-500">Save this information securely for future login</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                        M
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">Megatools.io</h1>
                    <p className="text-slate-500 mt-2">Complete Registration</p>
                    <div className="mt-3 p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-700">
                            <i className="fas fa-ticket-alt mr-2"></i>
                            Using Referral Code: <span className="font-mono bg-white px-2 py-0.5 rounded">{ref}</span>
                        </p>
                    </div>
                </div>
                
                {errorMessage && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-start gap-2 border border-red-100">
                        <i className="fas fa-exclamation-circle mt-0.5"></i>
                        <span>{errorMessage}</span>
                    </div>
                )}
                
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <input type="text" value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})}
                               placeholder="Type Username" required maxLength={10}
                               className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                        <div className="text-xs text-slate-500 mt-1">No spaces or dots, max 10 characters</div>
                    </div>

                    <div>
                        <input type="tel" value={regData.phone} onChange={e => setRegData({...regData, phone: formatPhone(e.target.value)})}
                               placeholder="Type Number" required
                               className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                    </div>

                    <div>
                        <input type="url" value={regData.facebook} onChange={e => setRegData({...regData, facebook: e.target.value})}
                               placeholder="Facebook Profile URL" required
                               className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                    </div>

                    <div>
                        <input type="email" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})}
                               placeholder="Type Gmail" required
                               className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                        <div className="text-xs text-slate-500 mt-1">Only @gmail.com addresses</div>
                    </div>

                    <div>
                        <input type="password" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})}
                               placeholder="Password" required minLength={6}
                               className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                        <div className="text-xs text-slate-500 mt-1">Minimum 6 characters</div>
                    </div>

                    <div>
                        <input type="password" value={regData.confirm_password} onChange={e => setRegData({...regData, confirm_password: e.target.value})}
                               placeholder="Confirm Password" required minLength={6}
                               className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-xs font-bold text-amber-700 flex items-center gap-2">
                            <i className="fas fa-info-circle"></i>
                            Your account will be pending approval. You'll be notified when activated.
                        </p>
                    </div>

                    <button type="submit" 
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3.5 rounded-lg transition-all shadow hover:shadow-lg">
                        Complete Signup
                    </button>
                </form>
                
                <div className="mt-6 text-center">
                    <p className="text-xs font-bold text-slate-400">Already have an account?</p>
                    <a href="/login" className="mt-1 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wide hover:underline">
                        Login Here
                    </a>
                </div>
            </div>
        </div>
    );
}
