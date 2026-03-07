import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';

export const ManageReferral = () => {
    const { currentUser, users, approveUser, blockUser, deleteUser, getReferralLink, showToast } = useStore();
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending' | 'Blocked'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<'name' | 'role' | 'status' | 'joined'>('joined');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const referralLink = currentUser ? getReferralLink(currentUser) : '';

    const getVisibleUsers = () => {
        if (!currentUser) return [];
        if (currentUser.role === 'Admin') {
            return users.filter((u: any) => u.id !== currentUser.id);
        }
        if (currentUser.role === 'Moderator') {
            return users.filter((u: any) => u.referrer_id === currentUser.id);
        }
        return [];
    };

    const processedUsers = useMemo(() => {
        let list = getVisibleUsers();
        
        if (statusFilter !== 'All') {
            list = list.filter((u: any) => u.status === statusFilter);
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            list = list.filter((u: any) => 
                u.name.toLowerCase().includes(query) || 
                u.username.toLowerCase().includes(query) || 
                u.email.toLowerCase().includes(query)
            );
        }
        
        list.sort((a: any, b: any) => {
            let valA = a[sortField] || '';
            let valB = b[sortField] || '';
            if (sortField === 'joined') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            }
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        
        return list;
    }, [users, currentUser, statusFilter, searchQuery, sortField, sortDir]);

    const stats = useMemo(() => {
        const list = getVisibleUsers();
        return { 
            total: list.length, 
            active: list.filter((u: any) => u.status === 'Active').length, 
            pending: list.filter((u: any) => u.status === 'Pending').length, 
            blocked: list.filter((u: any) => u.status === 'Blocked').length 
        };
    }, [users, currentUser]);

    const toggleSort = (field: any) => { 
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc'); 
        } else { 
            setSortField(field); 
            setSortDir('asc'); 
        } 
    };

    const handleApprove = (user: any) => {
        if (window.confirm(`Approve ${user.username} as ${user.role}?`)) {
            approveUser(user.id);
        }
    };

    const handleBlock = (user: any) => {
        if (window.confirm(`Block ${user.username}?`)) {
            blockUser(user.id);
        }
    };

    const handleDelete = (user: any) => {
        if (window.confirm(`Are you sure you want to delete ${user.username}? This action cannot be undone.`)) {
            deleteUser(user.id);
        }
    };

    const viewDetails = (user: any) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const copyReferralLink = () => {
        navigator.clipboard.writeText(referralLink);
        showToast('Copied!', 'Referral link copied to clipboard', 'success');
    };

    if (currentUser?.role === 'User') return (
        <div className="h-full w-full flex items-center justify-center p-4">
            <div className="text-center">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <i className="fas fa-lock text-4xl text-rose-500"></i>
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Access Denied</h2>
                <p className="text-slate-500 mt-2">Only Admins and Moderators can manage referrals.</p>
            </div>
        </div>
    );

    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar p-4">
            <div className="flex flex-col min-h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 font-sans animate-fade-in w-full transition-colors duration-300">
                <div className="flex-none px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-t-2xl">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                            <i className="fas fa-user-plus text-green-600 text-3xl"></i> 
                            User Management
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                            {currentUser?.role === 'Admin' 
                                ? 'Manage all users (Admins, Moderators & Users)' 
                                : 'Manage your team members'}
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-stretch">
                        <div className="relative min-w-[160px]">
                            <select 
                                value={statusFilter} 
                                onChange={e => setStatusFilter(e.target.value as any)} 
                                className="h-14 w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 cursor-pointer shadow-sm transition-all"
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active Only</option>
                                <option value="Pending">Pending Only</option>
                                <option value="Blocked">Blocked Only</option>
                            </select>
                            <i className="fas fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                        </div>
                        <div className="w-full md:w-80 relative">
                            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                            <input 
                                type="text" 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                placeholder="Search name, email, username..." 
                                className="pl-10 pr-4 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-bold text-slate-700 dark:text-slate-200 w-full focus:border-indigo-500 outline-none transition-all shadow-sm" 
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 p-6 bg-slate-50/30 dark:bg-slate-950/30">
                    <div className="w-full space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                                <div className="xl:w-1/3">
                                    <h3 className="text-slate-800 dark:text-white font-black text-xl flex items-center gap-3 mb-2">
                                        <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-base">
                                            <i className="fas fa-share-alt"></i>
                                        </span> 
                                        {currentUser?.role === 'Admin' ? 'Invite New Moderator' : 'Invite New User'}
                                    </h3>
                                    <p className="text-base text-slate-500 font-medium leading-relaxed">
                                        Share this unique referral link. New users will be automatically assigned under your management and require approval.
                                    </p>
                                </div>
                                <div className="xl:w-2/3">
                                    <div className="relative group flex items-stretch">
                                        <div className="flex-1 px-6 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-l-2xl border-r-0 text-lg font-bold text-blue-900 dark:text-blue-300 flex items-center h-16 truncate">
                                            <span className="truncate font-mono select-all text-sm">{referralLink}</span>
                                        </div>
                                        <button 
                                            onClick={copyReferralLink} 
                                            className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-r-2xl transition-colors flex items-center gap-2 shadow-lg font-black uppercase tracking-widest text-sm h-16"
                                        >
                                            <i className="fas fa-copy text-lg"></i> 
                                            Copy Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-44">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Total Managed</div>
                                        <div className="text-5xl font-black text-slate-800 dark:text-slate-100">{stats.total}</div>
                                    </div>
                                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 text-3xl">
                                        <i className="fas fa-users"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-44">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Active Users</div>
                                        <div className="text-5xl font-black text-emerald-500">{stats.active}</div>
                                    </div>
                                    <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 text-3xl">
                                        <i className="fas fa-user-check"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-44">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Pending Approval</div>
                                        <div className="text-5xl font-black text-amber-500">{stats.pending}</div>
                                    </div>
                                    <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 text-3xl">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-44">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Blocked</div>
                                        <div className="text-5xl font-black text-red-500">{stats.blocked}</div>
                                    </div>
                                    <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 text-3xl">
                                        <i className="fas fa-user-slash"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            {processedUsers.length === 0 ? (
                                <div className="p-20 text-center text-slate-300 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-5">
                                        <i className="fas fa-users-slash text-5xl text-slate-200"></i>
                                    </div>
                                    <p className="font-black text-xl text-slate-500">No users found</p>
                                    <p className="text-slate-400 mt-2">Share your referral link to get started</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-sm uppercase text-slate-500 font-black tracking-widest">
                                                <th className="px-6 py-4 cursor-pointer hover:text-indigo-600" onClick={() => toggleSort('name')}>
                                                    User Profile <i className={`fas ml-1 ${sortField === 'name' ? (sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'} text-indigo-500`}></i>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:text-indigo-600" onClick={() => toggleSort('role')}>
                                                    Role <i className={`fas ml-1 ${sortField === 'role' ? (sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'} text-indigo-500`}></i>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:text-indigo-600" onClick={() => toggleSort('status')}>
                                                    Status <i className={`fas ml-1 ${sortField === 'status' ? (sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'} text-indigo-500`}></i>
                                                </th>
                                                <th className="px-6 py-4 hidden md:table-cell cursor-pointer hover:text-indigo-600" onClick={() => toggleSort('joined')}>
                                                    Joined <i className={`fas ml-1 ${sortField === 'joined' ? (sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'} text-indigo-500`}></i>
                                                </th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {processedUsers.map((user: any) => (
                                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md font-bold ${user.avatar_color}`}>
                                                                {user.avatar}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-800 dark:text-slate-100 text-base">{user.name}</div>
                                                                <div className="text-sm text-slate-500 font-medium">{user.email}</div>
                                                                <div className="text-xs text-slate-400 font-mono mt-1 font-bold">@{user.username}</div>
                                                                <div className="text-xs text-slate-400 mt-1">
                                                                    <span className="font-bold">Ref Code:</span> {user.referral_code}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase border tracking-wider ${
                                                            user.role === 'Admin' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                            user.role === 'Moderator' ? 'bg-purple-50 text-purple-600 border-purple-200' : 
                                                            'bg-blue-50 text-blue-600 border-blue-200'
                                                        }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase border tracking-wider ${
                                                            user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                                                            user.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                                                            'bg-red-50 text-red-600 border-red-200'
                                                        }`}>
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                            {new Date(user.joined).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            {new Date(user.joined).toLocaleTimeString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => viewDetails(user)} className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center justify-center shadow-sm" title="View Details"><i className="fas fa-eye"></i></button>
                                                            
                                                            {user.status === 'Pending' && (
                                                                <button onClick={() => handleApprove(user)} className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 transition-all flex items-center justify-center shadow-sm" title="Approve User"><i className="fas fa-check"></i></button>
                                                            )}
                                                            
                                                            {user.status === 'Active' && (
                                                                <button onClick={() => handleBlock(user)} className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-100 transition-all flex items-center justify-center shadow-sm" title="Block User"><i className="fas fa-ban"></i></button>
                                                            )}
                                                            
                                                            {user.status === 'Blocked' && (
                                                                <button onClick={() => handleApprove(user)} className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 transition-all flex items-center justify-center shadow-sm" title="Unblock User"><i className="fas fa-check"></i></button>
                                                            )}
                                                            
                                                            <button onClick={() => handleDelete(user)} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-100 transition-all flex items-center justify-center shadow-sm" title="Delete User"><i className="fas fa-trash-alt"></i></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showDetailsModal && selectedUser && (
                <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetailsModal(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-6 shadow-2xl animate-modal-slide-in relative border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowDetailsModal(false)} className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><i className="fas fa-times text-base"></i></button>
                        
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl ${selectedUser.avatar_color}`}>{selectedUser.avatar}</div>
                            User Details
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Username</label><p className="text-lg font-bold text-slate-800 dark:text-white mt-1">@{selectedUser.username}</p></div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label><p className="text-lg font-bold text-slate-800 dark:text-white mt-1">{selectedUser.name}</p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</label><p className="text-lg font-bold text-slate-800 dark:text-white mt-1">{selectedUser.email}</p></div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone</label><p className="text-lg font-bold text-slate-800 dark:text-white mt-1">{selectedUser.phone || 'Not provided'}</p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Role</label><p className="text-lg font-bold mt-1"><span className={`px-3 py-1 rounded-lg text-sm ${selectedUser.role === 'Admin' ? 'bg-rose-100 text-rose-700' : selectedUser.role === 'Moderator' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{selectedUser.role}</span></p></div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</label><p className="text-lg font-bold mt-1"><span className={`px-3 py-1 rounded-lg text-sm ${selectedUser.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : selectedUser.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{selectedUser.status}</span></p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Referral Code</label><p className="text-lg font-mono font-bold text-slate-800 dark:text-white mt-1">{selectedUser.referral_code}</p></div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Joined Date</label><p className="text-lg font-bold text-slate-800 dark:text-white mt-1">{new Date(selectedUser.joined).toLocaleDateString()}</p></div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Facebook</label><p className="text-lg font-bold text-slate-800 dark:text-white mt-1">{selectedUser.facebook ? <a href={selectedUser.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedUser.facebook}</a> : 'Not provided'}</p></div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button onClick={() => setShowDetailsModal(false)} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black text-sm hover:bg-slate-200 transition-colors">Close</button>
                            
                            {selectedUser.status === 'Pending' && (
                                <button onClick={() => { handleApprove(selectedUser); setShowDetailsModal(false); }} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-sm transition-colors">Approve User</button>
                            )}
                            {selectedUser.status === 'Active' && (
                                <button onClick={() => { handleBlock(selectedUser); setShowDetailsModal(false); }} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-sm transition-colors">Block User</button>
                            )}
                            {selectedUser.status === 'Blocked' && (
                                <button onClick={() => { handleApprove(selectedUser); setShowDetailsModal(false); }} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-sm transition-colors">Unblock User</button>
                            )}
                            <button onClick={() => { handleDelete(selectedUser); setShowDetailsModal(false); }} className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-sm transition-colors">Delete User</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}