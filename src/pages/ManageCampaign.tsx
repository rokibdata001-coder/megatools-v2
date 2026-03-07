import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { TrafficLink, CampaignCategory } from '../store/types';

export const Campaign = () => {
    const { currentUser, visibleTrafficLinks, addTrafficLink, updateTrafficLink, deleteTrafficLink, getUserTrackingCode } = useStore();
    const [activeFilter, setActiveFilter] = useState<'again_domain' | 'other_domain' | 'type_input' | 'switch_domain'>('type_input');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [previewData, setPreviewData] = useState<TrafficLink | null>(null);
    const [formData, setFormData] = useState<Partial<TrafficLink>>({ name: '', url: '', category: 'type_input', access_scope: 'private' });

    const filteredLinks = useMemo(() => visibleTrafficLinks.filter((l: any) => l.category === activeFilter), [visibleTrafficLinks, activeFilter]);
    const canManage = currentUser?.role === 'Admin' || currentUser?.role === 'Moderator';

    const getCategoryLabel = (cat: CampaignCategory) => {
        switch(cat) { case 'switch_domain': case 'type_input': return 'Switch Action'; case 'again_domain': return 'Name Action'; case 'other_domain': return 'Quick Action'; default: return 'Link'; }
    };

    const getPersonalizedUrl = (baseUrl: string) => {
        if (!currentUser) return baseUrl;
        const randomAlias = getUserTrackingCode(currentUser);
        return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}id=${randomAlias}`;
    };

    const openModal = () => { setIsEditing(false); setFormData({ name: '', url: '', category: 'type_input', access_scope: 'private' }); setShowModal(true); };
    const editLink = (link: TrafficLink) => { setIsEditing(true); setFormData({ ...link }); setShowModal(true); };

    const saveLink = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.url || !currentUser) return;
        let cleanUrl = formData.url.trim();
        const forbidden = ['bonus', 'offer', 'profile', 'numbar'];
        if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
        for (const word of forbidden) if (cleanUrl.endsWith('/' + word)) cleanUrl = cleanUrl.slice(0, -(word.length + 1));
        if (!cleanUrl.endsWith('/')) cleanUrl += '/';

        if (isEditing && formData.id) updateTrafficLink({ ...formData, url: cleanUrl } as TrafficLink);
        else addTrafficLink({ id: 'lnk_' + Date.now(), name: formData.name, url: cleanUrl, category: formData.category as CampaignCategory, access_scope: formData.access_scope as 'global'|'private', owner_id: currentUser.id });
        setShowModal(false);
    };

    const handleDelete = (id: string) => { if (window.confirm('Are you sure you want to delete this link?')) deleteTrafficLink(id); };
    const copyUrl = (baseUrl: string) => { const url = getPersonalizedUrl(baseUrl); navigator.clipboard.writeText(url); alert('Tracking URL copied:\n' + url); };

    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar p-4">
            <div className="flex flex-col min-h-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans animate-fade-in w-full transition-colors duration-300">
                <div className="flex-none px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">📢 External URL</h2>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">Manage traffic destinations & Get Tracking Links</p>
                        </div>
                    </div>
                    {canManage && (
                        <button onClick={openModal} className="w-full sm:w-auto h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                            <i className="fas fa-plus text-base"></i> <span className="whitespace-nowrap">Add New URL</span>
                        </button>
                    )}
                </div>
                <div className="flex-1 p-6 bg-slate-50/30 dark:bg-slate-950/30">
                    <div className="flex flex-wrap gap-2 mb-6">
                        {['type_input', 'again_domain', 'other_domain'].map((filter) => (
                            <button key={filter} onClick={() => setActiveFilter(filter as any)} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm flex-1 sm:flex-none ${activeFilter === filter ? `bg-white dark:bg-slate-800 ${filter === 'type_input' ? 'text-blue-600 border-blue-100 dark:border-blue-800' : filter === 'again_domain' ? 'text-amber-600 border-amber-100 dark:border-amber-800' : 'text-purple-600 border-purple-100 dark:border-purple-800'}` : 'text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                                {filter === 'type_input' ? 'Switch Action' : filter === 'again_domain' ? 'Name Action' : 'Quick Action'}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                        {filteredLinks.length === 0 ? (
                            <div className="h-96 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                <i className="fas fa-link text-5xl mb-4 opacity-30"></i>
                                <span className="text-sm font-black uppercase tracking-widest">No links in this category</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest w-[80px]">ID</th>
                                            <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest w-[250px]">Campaign Name</th>
                                            <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest">Your Tracking URL</th>
                                            <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest w-[100px] text-center">Preview</th>
                                            <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest w-[220px]">Category</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[100px] text-center">Scope</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[140px] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredLinks.map((link: any) => (
                                            <tr key={link.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-6 py-4 align-middle"><span className="font-mono font-bold text-slate-400 text-xs">#{link.id.split('_')[1] || 'SYS'}</span></td>
                                                <td className="px-6 py-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-10 rounded-full shadow-sm ${link.category === 'again_domain' ? 'bg-amber-500' : link.category === 'other_domain' ? 'bg-purple-500' : link.category === 'type_input' ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
                                                        <div className="font-black text-slate-800 dark:text-slate-100 text-base leading-tight tracking-tight">{link.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-middle">
                                                    <div className="flex items-center gap-2 max-w-lg bg-slate-50 dark:bg-slate-800/50 py-2 px-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-300 cursor-pointer group/url shadow-sm" onClick={() => copyUrl(link.url)}>
                                                        <i className="fas fa-globe text-slate-400 text-sm"></i>
                                                        <div className="flex-1 truncate text-sm font-mono text-slate-700 dark:text-slate-300 font-bold tracking-tight" title={getPersonalizedUrl(link.url)}>{getPersonalizedUrl(link.url)}</div>
                                                        <i className="fas fa-copy text-slate-300 group-hover/url:text-indigo-500 transition-colors text-sm"></i>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-middle text-center">
                                                    <button onClick={() => setPreviewData(link)} className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-white hover:text-emerald-600 shadow-sm border border-slate-200 transition-all active:scale-95 flex items-center justify-center group/preview mx-auto" title="Mobile Preview"><i className="fas fa-mobile-alt text-base group-hover/preview:scale-110 transition-transform"></i></button>
                                                </td>
                                                <td className="px-6 py-4 align-middle">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border inline-block whitespace-nowrap shadow-sm ${link.category === 'again_domain' ? 'bg-amber-50 text-amber-600 border-amber-100' : link.category === 'other_domain' ? 'bg-purple-50 text-purple-600 border-purple-100' : link.category === 'type_input' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{getCategoryLabel(link.category)}</span>
                                                </td>
                                                <td className="px-6 py-4 align-middle text-center"><span className="text-xs font-black text-slate-400 uppercase tracking-wide">{link.access_scope || 'Global'}</span></td>
                                                <td className="px-6 py-4 align-middle text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {canManage ? (
                                                            <>
                                                                <button onClick={() => editLink(link)} className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-white hover:text-indigo-600 shadow-sm border border-slate-200 transition-all active:scale-95 flex items-center justify-center"><i className="fas fa-pen text-xs"></i></button>
                                                                <button onClick={() => handleDelete(link.id)} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100 transition-all active:scale-95 flex items-center justify-center shadow-sm"><i className="fas fa-trash-alt text-xs"></i></button>
                                                            </>
                                                        ) : <span className="text-slate-300 text-base ml-2"><i className="fas fa-lock"></i></span>}
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

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-modal-slide-in relative border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><i className="fas fa-times text-base"></i></button>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-5">{isEditing ? 'Edit Campaign URL' : 'New Campaign URL'}</h2>
                        <form onSubmit={saveLink} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Campaign Name</label>
                                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Summer Sale Landing" className="w-full h-12 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 font-bold outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Destination URL</label>
                                <input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://520-654-3251.info/" className="w-full h-12 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 font-bold outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" required />
                                <p className="text-[10px] text-slate-400 font-bold pl-1">Enter the base link. Your ID will be auto-appended after saving.</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Category Type</label>
                                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full h-12 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 font-bold outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 appearance-none">
                                    <option value="type_input">Switch Action</option>
                                    <option value="again_domain">Name Action</option>
                                    <option value="other_domain">Quick Action</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Access Scope</label>
                                <select value={formData.access_scope} onChange={e => setFormData({...formData, access_scope: e.target.value as any})} className="w-full h-12 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 font-bold outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 appearance-none">
                                    <option value="private">Private (Only Me)</option>
                                    <option value="global">Global (All Users)</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 mt-3">{isEditing ? 'Update Link' : 'Create Link'}</button>
                        </form>
                    </div>
                </div>
            )}

            {previewData && (
                <div className="fixed inset-0 bg-slate-900/90 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewData(null)}>
                    <button onClick={() => setPreviewData(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center backdrop-blur-md z-[160] shadow-lg border border-white/10"><i className="fas fa-times text-lg"></i></button>
                    <div className="relative w-[350px] h-[700px] bg-slate-950 rounded-[3rem] shadow-2xl border-[8px] border-slate-800 overflow-hidden shrink-0 flex flex-col transform transition-transform scale-[0.85] sm:scale-100" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-2xl z-20 flex items-center justify-center gap-2">
                            <div className="w-10 h-1.5 bg-slate-700 rounded-full"></div><div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                        </div>
                        <div className="h-8 bg-white dark:bg-black w-full flex justify-between items-center px-6 pt-2 z-10 text-[10px] font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/50">
                            <span>9:41</span><div className="flex gap-1.5"><i className="fas fa-signal"></i><i className="fas fa-wifi"></i><i className="fas fa-battery-full"></i></div>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-900 py-2 px-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                            <div className="flex-1 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center px-3 text-[10px] text-slate-500 truncate shadow-sm">
                                <i className="fas fa-lock text-[8px] mr-1.5 text-emerald-500"></i><span className="truncate">{getPersonalizedUrl(previewData.url)}</span>
                            </div>
                            <button className="w-8 h-8 flex items-center justify-center text-slate-400"><i className="fas fa-redo-alt text-xs"></i></button>
                        </div>
                        <div className="flex-1 bg-white relative">
                            <iframe src={getPersonalizedUrl(previewData.url)} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
                        </div>
                        <div className="h-5 bg-white dark:bg-black flex justify-center items-end pb-1.5 border-t border-slate-100 dark:border-slate-800/50">
                            <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}