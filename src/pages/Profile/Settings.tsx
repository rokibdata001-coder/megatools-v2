import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store';

export const Settings = () => {
    const { currentUser, updateUsername, updateProfile, updatePassword, getUserTrackingCode } = useStore();
    const [profile, setProfile] = useState({ username: '', name: '', email: '', phone: '', facebook: '', joined: '', referral_code: '', status: '', avatar: '', tracking_code: '' });
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentUser) setProfile({ 
            username: currentUser.username, 
            name: currentUser.name, 
            email: currentUser.email, 
            phone: currentUser.phone, 
            facebook: currentUser.facebook, 
            joined: new Date(currentUser.joined).toLocaleDateString(), 
            referral_code: currentUser.referral_code, 
            status: currentUser.status, 
            avatar: currentUser.avatar || '👤', 
            tracking_code: getUserTrackingCode(currentUser) 
        });
    }, [currentUser]);

    const handleFileSelect = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return alert('File size too large. Max 2MB allowed.');
            const reader = new FileReader();
            reader.onload = (ev: any) => setProfile(p => ({ ...p, avatar: ev.target.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        if (profile.username !== currentUser.username) {
            const res = updateUsername(currentUser.id, profile.username);
            if (!res.success) return alert(res.message);
        }
        updateProfile(currentUser.id, { name: profile.name, phone: profile.phone, facebook: profile.facebook, avatar: profile.avatar });
        alert("Profile settings saved successfully!");
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordStatus(null);
        if (!currentUser) return;
        if (passwordForm.current !== currentUser.password) return setPasswordStatus({ type: 'error', message: 'Current password is incorrect.' });
        if (passwordForm.new !== passwordForm.confirm) return setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
        if (passwordForm.new.length < 6) return setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
        updatePassword(currentUser.id, passwordForm.new);
        setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
        setPasswordForm({ current: '', new: '', confirm: '' });
    };

    return (
        <div className="h-full w-full p-6">
            <div className="flex flex-col min-h-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 font-sans animate-fade-in w-full transition-colors duration-300">
                <div className="flex-none px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm rounded-t-2xl">
                    <div><h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3"><span className="text-slate-800 dark:text-white text-4xl">⚙️</span> Account Settings</h1><p className="text-slate-500 text-lg font-medium mt-2">Manage your personal information and security</p></div>
                </div>
                <div className="flex-1 p-8 bg-slate-50/30 dark:bg-slate-950/30">
                    <div className="w-full space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"><h2 className="font-black text-2xl text-slate-800 dark:text-white flex items-center gap-4"><span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"><i className="fas fa-user text-xl"></i></span> Profile Information</h2></div>
                            <div className="p-10">
                                <div className="flex flex-col lg:flex-row items-center gap-10 mb-12 pb-12 border-b border-slate-100 dark:border-slate-800">
                                    <div className="relative group">
                                        <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-white shadow-2xl ring-1 ring-slate-200 bg-slate-100 flex items-center justify-center">
                                            {profile.avatar?.startsWith('data:') || profile.avatar?.startsWith('http') ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <span className="text-7xl select-none">{profile.avatar}</span>}
                                        </div>
                                        <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 w-12 h-12 bg-indigo-600 text-white rounded-full border-4 border-white flex items-center justify-center shadow-xl hover:bg-indigo-700 transition-colors active:scale-95"><i className="fas fa-camera text-lg"></i></button>
                                    </div>
                                    <div className="text-center lg:text-left">
                                        <h3 className="font-black text-2xl text-slate-800 dark:text-white">Profile Photo</h3><p className="text-base text-slate-500 mt-2 mb-6 font-medium">Supports JPG, PNG or GIF. Max size 2MB.</p>
                                        <div className="flex gap-4 justify-center lg:justify-start">
                                            <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wide rounded-xl hover:bg-slate-50 transition-colors active:scale-95 shadow-sm">Upload New</button>
                                            <button onClick={() => setProfile(p => ({...p, avatar: '👤'}))} className="px-6 py-3 bg-white border border-slate-200 text-rose-500 text-xs font-black uppercase tracking-wide rounded-xl hover:bg-rose-50 transition-colors active:scale-95 shadow-sm">Reset</button>
                                        </div>
                                        <input ref={fileInputRef} type="file" onChange={handleFileSelect} accept="image/*" className="hidden" />
                                    </div>
                                </div>
                                <form onSubmit={handleProfileSave} className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-3"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Account Email</label><div className="flex items-center px-6 h-16 border border-slate-200 rounded-2xl bg-slate-50 text-slate-500 cursor-not-allowed font-bold text-lg"><i className="fas fa-envelope mr-4 text-slate-400"></i><span className="truncate">{profile.email}</span></div><p className="text-xs text-slate-400 font-bold pl-1">Email cannot be changed</p></div>
                                        <div className="space-y-3"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Username</label><div className="flex items-center px-6 h-16 border border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white"><i className="fas fa-at mr-4 text-slate-400 text-xl"></i><input type="text" value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} maxLength={10} className="flex-1 outline-none text-lg font-bold text-slate-800 bg-transparent min-w-0" required /></div><p className="text-xs text-slate-400 font-bold pl-1">Max 10 characters. Must be unique.</p></div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-3"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label><div className="flex items-center px-6 h-16 border border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white"><i className="fas fa-signature mr-4 text-slate-400 text-xl"></i><input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="flex-1 outline-none text-lg font-bold text-slate-800 bg-transparent min-w-0" required /></div></div>
                                        <div className="space-y-3"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label><div className="flex items-center px-6 h-16 border border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white"><i className="fas fa-phone mr-4 text-slate-400 text-xl"></i><input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="flex-1 outline-none text-lg font-bold text-slate-800 bg-transparent min-w-0" /></div></div>
                                    </div>
                                    <div className="space-y-3"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Facebook Profile</label><div className="flex items-center px-6 h-16 border border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white"><i className="fab fa-facebook mr-4 text-slate-400 text-xl"></i><input type="text" value={profile.facebook} onChange={e => setProfile({...profile, facebook: e.target.value})} className="flex-1 outline-none text-lg font-bold text-slate-800 bg-transparent min-w-0" /></div></div>
                                    <div className="pt-8 flex justify-end border-t border-slate-100 mt-8"><button type="submit" className="w-full sm:w-auto px-10 h-16 text-sm font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-colors flex items-center justify-center gap-4 shadow-xl active:scale-95"><i className="fas fa-save text-xl"></i> Save Profile Changes</button></div>
                                </form>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-full flex flex-col">
                                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"><h2 className="font-black text-2xl text-slate-800 dark:text-white flex items-center gap-4"><span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><i className="fas fa-lock text-xl"></i></span> Change Password</h2></div>
                                <div className="p-10 flex-1">
                                    {passwordStatus && <div className={`mb-8 p-6 rounded-2xl flex items-center gap-4 border ${passwordStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}><span className="text-3xl">{passwordStatus.type === 'success' ? '✅' : '⚠️'}</span><span className="text-base font-bold">{passwordStatus.message}</span></div>}
                                    <form onSubmit={handlePasswordUpdate} className="space-y-8">
                                        <div className="space-y-3"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Current Password</label><div className="flex items-center px-6 h-16 border border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white"><i className="fas fa-key mr-4 text-slate-400 text-xl"></i><input type="password" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="flex-1 outline-none text-lg font-bold text-slate-800 bg-transparent min-w-0" required /></div></div>
                                        <div className="space-y-3"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">New Password</label><div className="flex items-center px-6 h-16 border border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white"><i className="fas fa-shield-alt mr-4 text-slate-400 text-xl"></i><input type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="flex-1 outline-none text-lg font-bold text-slate-800 bg-transparent min-w-0" required /></div><p className="text-xs text-slate-400 font-bold pl-1">Minimum 6 characters</p></div>
                                        <div className="space-y-3"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Confirm New Password</label><div className="flex items-center px-6 h-16 border border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white"><i className="fas fa-check-circle mr-4 text-slate-400 text-xl"></i><input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="flex-1 outline-none text-lg font-bold text-slate-800 bg-transparent min-w-0" required /></div></div>
                                        <div className="pt-6"><button type="submit" className="w-full px-8 h-16 text-sm font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-colors flex items-center justify-center gap-4 shadow-lg active:scale-95"><i className="fas fa-sync-alt text-xl"></i> Update Password</button></div>
                                    </form>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-full flex flex-col">
                                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"><h2 className="font-black text-2xl text-slate-800 dark:text-white flex items-center gap-4"><span className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600"><i className="fas fa-info-circle text-xl"></i></span> Account Information</h2></div>
                                <div className="p-10 flex-1 flex flex-col justify-center">
                                    <div className="grid grid-cols-1 gap-10">
                                        <div className="space-y-8">
                                            <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Account Role</label><span className={`px-6 py-3 rounded-2xl text-base font-black uppercase border shadow-sm inline-block ${currentUser?.role === 'Admin' ? 'text-indigo-600 bg-indigo-50 border-indigo-200' : currentUser?.role === 'Moderator' ? 'text-purple-600 bg-purple-50 border-purple-200' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>Team {currentUser?.role}</span></div>
                                            <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Account Status</label><span className="px-6 py-3 rounded-2xl text-base font-black uppercase border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm inline-block">{profile.status}</span></div>
                                        </div>
                                        <div className="space-y-8">
                                            <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Member Since</label><div className="flex items-center gap-4 text-xl text-slate-700 font-bold h-12"><i className="fas fa-calendar-alt text-slate-400 text-2xl"></i> {profile.joined}</div></div>
                                            <div>
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Referral Code</label>
                                                <div className="flex flex-wrap items-center gap-4"><code className="px-6 py-3 bg-slate-100 text-indigo-600 rounded-2xl font-mono text-xl font-bold border border-slate-200 shadow-inner">{profile.referral_code}</code><button onClick={() => { navigator.clipboard.writeText(profile.referral_code); alert('Copied!'); }} className="w-14 h-14 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all active:scale-95 flex items-center justify-center border border-slate-200"><i className="fas fa-copy text-xl"></i></button></div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Campaign Tracking ID</label>
                                                <div className="flex flex-wrap items-center gap-4"><code className="px-6 py-3 bg-slate-100 text-pink-600 rounded-2xl font-mono text-xl font-bold border border-slate-200 shadow-inner">{profile.tracking_code}</code><button onClick={() => { navigator.clipboard.writeText(profile.tracking_code); alert('Copied!'); }} className="w-14 h-14 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-500 hover:text-pink-600 transition-all active:scale-95 flex items-center justify-center border border-slate-200"><i className="fas fa-copy text-xl"></i></button></div>
                                                <p className="text-xs text-slate-400 font-bold mt-2">Auto-appended to your campaign links (e.g. /?id={profile.tracking_code})</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}