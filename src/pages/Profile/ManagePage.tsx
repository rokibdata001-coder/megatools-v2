import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { NavPosition } from '../../store/types';

export const ManagePage = () => {
    const { navigation, updateNavigation, deleteNav } = useStore();
    const [activeTab, setActiveTab] = useState<'groups' | 'single'>('groups');
    const [modalState, setModalState] = useState<'createGroup' | 'addPage' | 'createSingle' | null>(null);
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', url: '', icon: '', position: 'sidebar' as NavPosition, parentId: '' });

    const currentList = useMemo(() => navigation.filter((n: any) => activeTab === 'groups' ? n.type === 'dropdown' : n.type === 'direct'), [navigation, activeTab]);
    const stats = useMemo(() => {
        let totalPages = 0, groupCount = 0, singleCount = 0;
        navigation.forEach((n: any) => { if (n.type === 'dropdown') { groupCount++; totalPages += n.items.length; } else { singleCount++; totalPages++; } });
        return { totalPages, groupCount, singleCount };
    }, [navigation]);

    const groupOptions = useMemo(() => navigation.filter((n: any) => n.type === 'dropdown').map((n: any) => ({ id: n.id, label: n.label })), [navigation]);

    const openModal = (type: 'createGroup' | 'addPage' | 'createSingle') => {
        setFormData({ name: '', url: '', icon: '', position: 'sidebar', parentId: type === 'addPage' && groupOptions.length > 0 ? groupOptions[0].id : '' });
        setModalState(type);
    };

    const submitForm = () => {
        if (modalState === 'createGroup' && formData.name) {
            updateNavigation([...navigation, { id: 'grp_' + Date.now(), label: formData.name, icon: formData.icon || '📁', type: 'dropdown', position: formData.position, items: [] }]);
        } else if (modalState === 'createSingle' && formData.name && formData.url) {
            updateNavigation([...navigation, { id: 'btn_' + Date.now(), label: formData.name, icon: formData.icon || '🔗', type: 'direct', position: formData.position, url: formData.url, access: 'private', mode: 'iframe' }]);
        } else if (modalState === 'addPage' && formData.name && formData.url && formData.parentId) {
            updateNavigation(navigation.map((n: any) => n.id === formData.parentId && n.type === 'dropdown' ? { ...n, items: [...n.items, { id: 'pg_' + Date.now(), name: formData.name, url: formData.url, icon: formData.icon || '📄', access: 'private', mode: 'iframe', short_key: '' }] } : n));
        }
        setModalState(null);
    };

    const handleDelete = (id: string, parentId?: string) => { if (window.confirm('Delete this item?')) deleteNav(id, parentId); };

    const integrationCode = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>External Page</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n  <script>\n    tailwind.config = { darkMode: 'class' }\n  </script>\n  <script>\n    window.addEventListener('message', (event) => {\n       if (event.data.theme === 'dark') document.documentElement.classList.add('dark');\n       else if (event.data.theme === 'light') document.documentElement.classList.remove('dark');\n    });\n  </script>\n</head>\n<body class="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 min-h-screen p-8 transition-colors duration-300">\n    <h1 class="text-3xl font-black">My External Page</h1>\n</body>\n</html>`;

    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar p-4">
            <div className="flex flex-col min-h-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans animate-fade-in transition-colors duration-300">
                <div className="flex-none px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm rounded-t-2xl">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3"><span className="text-indigo-600 dark:text-indigo-400 text-3xl">⚙️</span> Page Control</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Full control over where your links appear</p>
                    </div>
                    <button onClick={() => setShowTokenModal(true)} className="h-10 px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"><i className="fas fa-code text-emerald-400"></i> UI Kit Token</button>
                </div>
                <div className="flex-1 p-6 bg-slate-50/30 dark:bg-slate-950/30">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm"><div className="text-4xl font-black text-slate-800 dark:text-slate-100">{stats.totalPages}</div><div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Total Items</div></div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm"><div className="text-4xl font-black text-slate-800 dark:text-slate-100">{stats.groupCount}</div><div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Groups</div></div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm"><div className="text-4xl font-black text-slate-800 dark:text-slate-100">{stats.singleCount}</div><div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Single Buttons</div></div>
                    </div>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full max-w-xl mx-auto mb-8 border border-slate-200 dark:border-slate-700 shadow-inner">
                        <button onClick={() => setActiveTab('groups')} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all uppercase tracking-wider ${activeTab === 'groups' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-500'}`}>Manage Groups</button>
                        <button onClick={() => setActiveTab('single')} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all uppercase tracking-wider ${activeTab === 'single' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-500'}`}>Single Buttons</button>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px]">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                            <h2 className="font-black text-slate-800 dark:text-white text-base uppercase tracking-widest flex items-center gap-2">{activeTab === 'groups' ? '📂 Group Setup' : '🔘 Button Setup'}</h2>
                            <div className="flex gap-3 w-full sm:w-auto">
                                {activeTab === 'groups' ? (
                                    <><button onClick={() => openModal('createGroup')} className="flex-1 sm:flex-none h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg">New Group</button><button onClick={() => openModal('addPage')} className="flex-1 sm:flex-none h-10 px-5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg">Add New Page</button></>
                                ) : <button onClick={() => openModal('createSingle')} className="flex-1 sm:flex-none h-10 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg">Create Button</button>}
                            </div>
                        </div>
                        <div className="p-0">
                            {currentList.length === 0 ? (
                                <div className="p-24 text-center flex flex-col items-center justify-center space-y-6"><span className="text-6xl grayscale opacity-30">🕳️</span><p className="text-slate-400 text-sm font-black uppercase tracking-wide">No items in this category</p></div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[800px]">
                                        <thead><tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 font-black tracking-widest"><th className="px-6 py-4">Name</th><th className="px-6 py-4">Placement</th><th className="px-6 py-4 text-center">Icon</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {currentList.map((item: any) => (
                                                <React.Fragment key={item.id}>
                                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                        <td className="px-6 py-4"><div><div className="font-black text-slate-800 dark:text-slate-200 text-base">{item.label || item.name}</div>{item.type === 'dropdown' && <div className="text-xs text-slate-400 font-bold mt-1 pl-1">{item.items.length} pages inside</div>}</div></td>
                                                        <td className="px-6 py-4"><span className={`px-3 py-1 rounded-lg text-xs font-black uppercase border tracking-wider ${item.position === 'sidebar' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600'}`}>{item.position}</span></td>
                                                        <td className="px-6 py-4 text-center text-2xl">{item.icon}</td>
                                                        <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(item.id)} className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center active:scale-95 ml-auto shadow-sm"><i className="fas fa-trash-alt"></i></button></td>
                                                    </tr>
                                                    {item.type === 'dropdown' && item.items.map((page: any) => (
                                                        <tr key={page.id} className="bg-slate-50/50 dark:bg-slate-900/30">
                                                            <td className="px-6 py-3 pl-12"><div className="flex items-center gap-2"><i className="fas fa-level-up-alt rotate-90 text-slate-300"></i><div><div className="font-bold text-slate-700 dark:text-slate-300 text-sm">{page.name}</div><div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{page.url}</div></div></div></td>
                                                            <td className="px-6 py-3"></td><td className="px-6 py-3 text-center text-lg grayscale opacity-70">{page.icon}</td>
                                                            <td className="px-6 py-3 text-right"><button onClick={() => handleDelete(page.id, item.id)} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center ml-auto text-xs shadow-sm"><i className="fas fa-times"></i></button></td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {modalState && (
                <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setModalState(null)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-modal-slide-in relative border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setModalState(null)} className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><i className="fas fa-times text-base"></i></button>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-5">{modalState === 'createGroup' ? 'Create New Group' : modalState === 'addPage' ? 'Add Page to Group' : 'Create Single Button'}</h2>
                        <div className="space-y-4">
                            {modalState === 'addPage' && (
                                <div className="space-y-1"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Select Group</label><select value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})} className="w-full h-12 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 font-bold outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{groupOptions.map((g: any) => <option key={g.id} value={g.id}>{g.label}</option>)}</select></div>
                            )}
                            <div className="space-y-1"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{modalState === 'createGroup' ? 'Group Name' : modalState === 'addPage' ? 'Page Name' : 'Button Label'}</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 font-bold outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" /></div>
                            {modalState !== 'createGroup' && <div className="space-y-1"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">URL</label><input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full h-12 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 font-bold outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" /></div>}
                            {modalState !== 'addPage' && <div className="space-y-1"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Position</label><select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value as any})} className="w-full h-12 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 font-bold outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"><option value="sidebar">Sidebar</option><option value="topbar">Top Bar</option></select></div>}
                            <div className="space-y-1"><label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Icon</label><input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full h-12 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 font-bold outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" /></div>
                            <button onClick={submitForm} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 mt-3">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {showTokenModal && (
                <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[200] animate-fade-in flex flex-col">
                    <button onClick={() => setShowTokenModal(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center shadow-lg z-50"><i className="fas fa-times text-lg"></i></button>
                    <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
                        <div className="max-w-4xl w-full space-y-6">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto text-indigo-600 text-4xl shadow-sm mb-5"><i className="fas fa-magic"></i></div>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Seamless Integration Kit</h2>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl relative group overflow-hidden shadow-2xl">
                                <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">index.html</span>
                                    <button onClick={() => { navigator.clipboard.writeText(integrationCode); alert('Copied!'); }} className="text-xs font-black text-indigo-400 hover:text-white uppercase tracking-widest flex items-center gap-2"><i className="fas fa-copy"></i> Copy Code</button>
                                </div>
                                <textarea readOnly value={integrationCode} className="w-full h-[350px] bg-slate-900 text-slate-300 font-mono text-sm p-6 outline-none resize-none leading-relaxed" spellCheck="false" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}