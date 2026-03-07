import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Session } from '../store/types';

export const History = () => {
    const { visibleTrafficHistory } = useStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const pageSize = 50;

    const stats = useMemo(() => {
        return {
            total: visibleTrafficHistory.length,
            mobile: visibleTrafficHistory.filter((x: any) => x.device_type === 'mobile').length,
            desktop: visibleTrafficHistory.filter((x: any) => x.device_type === 'desktop').length,
            total_step_clicks: visibleTrafficHistory.reduce((acc: number, session: any) => acc + Object.values(session.form_data).filter((item: any) => item.value).length, 0)
        };
    }, [visibleTrafficHistory]);

    const totalPages = Math.ceil(visibleTrafficHistory.length / pageSize);
    const paginatedData = useMemo(() => visibleTrafficHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize), [visibleTrafficHistory, currentPage]);

    const visiblePages = useMemo(() => {
        if (totalPages <= 7) return Array.from({length: totalPages}, (_, i) => i + 1);
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
        return Array.from({length: (endPage - startPage + 1)}, (_, i) => startPage + i);
    }, [totalPages, currentPage]);

    const getSessionDataString = () => {
        if (!selectedSession) return '';
        const s = selectedSession;
        const lines = [
            `ID: ${s.sequential_id}`, `User: ${s.form_data['name']?.value || 'Anonymous'}`, `Email: ${s.form_data['email']?.value || 'No email'}`,
            `Device: ${s.device_type} (${s.device_os})`, `Browser: ${s.browser}`, `Status: ${s.status}`, `Date: ${new Date(s.created_at).toLocaleString()}`, '', '=== FORM DATA ==='
        ];
        Object.entries(s.form_data).forEach(([key, val]: any) => { if (val.value) lines.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${val.value}`); });
        return lines.join('\n');
    };

    return (
        <div className="h-full w-full p-6">
            <div className="flex flex-col min-h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 font-sans animate-fade-in w-full transition-colors duration-300">
                <div className="flex-none px-6 lg:px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center rounded-t-2xl">
                    <div><h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">📜 My History</h2><p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Archived Sessions Database</p></div>
                    <div className="text-sm font-black text-slate-500 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">{new Date().toLocaleDateString()}</div>
                </div>
                <div className="flex-1 p-6 lg:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 rounded-2xl p-6 flex flex-col justify-between h-36 relative overflow-hidden group shadow-sm"><div className="text-xs font-black text-blue-500 uppercase tracking-widest relative z-10">Total Mobile Click</div><div className="text-5xl font-black text-blue-700 mt-1 relative z-10">{stats.mobile}</div></div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 rounded-2xl p-6 flex flex-col justify-between h-36 relative overflow-hidden group shadow-sm"><div className="text-xs font-black text-indigo-500 uppercase tracking-widest relative z-10">Total Desktop Click</div><div className="text-5xl font-black text-indigo-700 mt-1 relative z-10">{stats.desktop}</div></div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 rounded-2xl p-6 flex flex-col justify-between h-36 relative overflow-hidden group shadow-sm"><div className="text-xs font-black text-purple-500 uppercase tracking-widest relative z-10">Total Sessions</div><div className="text-5xl font-black text-purple-700 mt-1 relative z-10">{stats.total}</div></div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 rounded-2xl p-6 flex flex-col justify-between h-36 relative overflow-hidden group shadow-sm"><div className="text-xs font-black text-emerald-500 uppercase tracking-widest relative z-10">Total Inputs</div><div className="text-5xl font-black text-emerald-700 mt-1 relative z-10">{stats.total_step_clicks}</div></div>
                    </div>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex flex-col">
                        <div className="overflow-x-hidden">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"><tr className="text-xs font-black text-slate-500 uppercase tracking-widest"><th className="py-5 px-6 w-[120px]">ID</th><th className="py-5 px-6">User Profile</th><th className="py-5 px-6 w-[180px]">Device Info</th><th className="py-5 px-6 w-[200px]">Timestamp</th><th className="py-5 px-6 text-center w-[150px]">Status</th><th className="py-5 px-6 text-right w-[160px]">Actions</th></tr></thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginatedData.map((session: any) => (
                                        <tr key={session.sequential_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4"><div className="font-mono font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 w-fit text-sm">{session.sequential_id}</div></td>
                                            <td className="px-6 py-4"><div><div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{session.form_data['name']?.value || 'Anonymous'}</div><div className="text-xs text-slate-400 font-medium mt-1">{session.form_data['email']?.value || 'No email'}</div></div></td>
                                            <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 flex items-center justify-center text-slate-500"><i className={`fas text-lg ${session.device_type === 'mobile' ? 'fa-mobile-alt' : 'fa-desktop'}`}></i></div><span className="text-xs font-bold text-slate-600 capitalize">{session.device_type}</span></div></td>
                                            <td className="px-6 py-4"><div className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(session.created_at).toLocaleDateString()}</div><div className="text-xs text-slate-400 font-black uppercase tracking-wide mt-1">{new Date(session.created_at).toLocaleTimeString()}</div></td>
                                            <td className="px-6 py-4 text-center"><span className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wide border ${session.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{session.status}</span></td>
                                            <td className="px-6 py-4 text-right"><button onClick={() => setSelectedSession(session)} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-600 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2 ml-auto"><i className="fas fa-eye"></i> View Data</button></td>
                                        </tr>
                                    ))}
                                    {paginatedData.length === 0 && <tr><td colSpan={6} className="py-24 px-4 text-center text-slate-400"><div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100"><i className="fas fa-history text-3xl text-slate-300"></i></div><p className="font-bold text-lg text-slate-600 mb-1">No history records found</p></td></tr>}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div className="text-xs font-bold text-slate-500">Showing <span className="text-slate-800">{((currentPage - 1) * pageSize) + 1}</span> to <span className="text-slate-800">{Math.min(currentPage * pageSize, stats.total)}</span> of <span className="text-slate-800">{stats.total}</span> entries</div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50"><i className="fas fa-chevron-left"></i></button>
                                    <div className="flex items-center gap-2">{visiblePages.map(page => <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all shadow-sm ${currentPage === page ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>{page}</button>)}</div>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50"><i className="fas fa-chevron-right"></i></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {selectedSession && (
                    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedSession(null)}>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl p-0 shadow-2xl animate-modal-slide-in relative overflow-hidden flex flex-col max-h-[90vh] border dark:border-slate-800" onClick={e => e.stopPropagation()}>
                            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                                <div><h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3"><span className="bg-indigo-50 text-indigo-600 p-2 rounded-lg"><i className="fas fa-file-alt text-xl"></i></span> Session Data Log</h3><p className="text-sm font-bold text-slate-400 uppercase tracking-wide mt-2 ml-14">ID: {selectedSession.sequential_id} • {new Date(selectedSession.created_at).toLocaleString()}</p></div>
                                <div className="flex gap-3"><button onClick={() => { navigator.clipboard.writeText(getSessionDataString()); alert('Copied!'); }} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wide rounded-xl shadow-lg active:scale-95 flex items-center gap-2"><i className="fas fa-copy"></i> Copy Raw Data</button><button onClick={() => setSelectedSession(null)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-rose-500 transition-colors flex items-center justify-center"><i className="fas fa-times text-lg"></i></button></div>
                            </div>
                            <div className="p-8 bg-slate-50 dark:bg-slate-950 overflow-hidden">
                                <div className="notepad-container bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                                    <div className="notepad-line-numbers bg-slate-50 dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 text-slate-400 pt-6">{getSessionDataString().split('\n').map((_, i) => <div key={i} className="h-[28px] leading-[28px]">{i + 1}</div>)}</div>
                                    <textarea className="notepad-textarea p-6 text-base text-slate-700 dark:text-slate-300 font-mono leading-[28px]" readOnly value={getSessionDataString()} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}