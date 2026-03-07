import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { Session } from '../store/types';

const ReceiveExternalInputData = ({ session, acknowledgedFields, markFieldAsSeen }: { session: Session, acknowledgedFields: Set<string>, markFieldAsSeen: (key: string) => void }) => {
    const { showToast } = useStore();
    
    const slots = useMemo(() => {
        const formData = session.form_data;
        if (!formData) return Array.from({ length: 21 }, () => ({ key: '', value: '', isUnread: false }));
        
        const isUnread = (field: string) => {
            const val = formData[field]?.value;
            if (!val || val === '-') return false;
            return !acknowledgedFields.has(`${session.traffic_id}-${field}`);
        };

        const nameData = { key: 'name', value: formData['name']?.value || '', isUnread: isUnread('name') };
        const emailData = { key: 'email', value: formData['email']?.value || '', isUnread: isUnread('email') };
        
        const excludedKeys = ['name', 'email', 'ip', 'agent'];
        const availableKeys = Object.keys(formData).filter(k => !excludedKeys.includes(k) && formData[k].value);
        
        const dynamicSlots = Array.from({ length: 19 }, (_, i) => {
            const key = availableKeys[i];
            return key ? { key, value: formData[key].value || '', isUnread: isUnread(key) } : { key: '', value: '', isUnread: false };
        });
        
        return [nameData, emailData, ...dynamicSlots];
    }, [session, acknowledgedFields]);

    const isUrl = (val: string) => !!val && (val.toLowerCase().startsWith('http://') || val.toLowerCase().startsWith('https://'));
    
    const copyAndMark = (key: string, value: string) => {
        if (!value || value === '-') return;
        navigator.clipboard.writeText(value);
        if (key) markFieldAsSeen(key);
        showToast('Copied', 'Data copied to clipboard', 'success');
    };

    return (
        <>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-1 flex items-center gap-2">
                Receive External Input Data List: <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 relative z-0 mb-4">
                {slots.map((item, i) => (
                    <div key={i} className="relative group">
                        <label className="absolute -top-2 left-3 bg-white dark:bg-slate-900 px-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest z-10 truncate max-w-[90%]">
                            {i === 0 ? 'Name' : i === 1 ? 'Email' : item.key || `Input ${i + 1}`}
                        </label>
                        <div className="relative">
                            <input type="text" readOnly value={item.value} onClick={() => copyAndMark(item.key, item.value)}
                                className={`w-full h-11 bg-white dark:bg-slate-900 border rounded-xl px-3 text-sm font-bold outline-none transition-all cursor-pointer truncate text-slate-700 dark:text-slate-200 ${isUrl(item.value) ? 'pr-9' : ''} ${item.isUnread ? 'border-rose-400 dark:border-rose-600' : 'border-slate-200 dark:border-slate-700'}`}
                                title={item.key ? `${item.key}: ${item.value}` : 'Empty Slot'} />
                            {item.isUnread && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm z-20 pointer-events-none"></span>}
                            {isUrl(item.value) && (
                                <button onClick={() => window.open(item.value, '_blank')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all z-10" title="Open Link">
                                    <i className="fas fa-external-link-alt"></i>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

const OverviewDropdown = ({ session, acknowledgedFields, markFieldAsSeen }: any) => {
    const { links } = useStore();
    
    const activeLinkData = useMemo(() => {
        if (session.status === 'redirecting') {
            if (session.awaiting_reentry) {
                const link = links.find((l: any) => l.category === 'again_domain');
                if (link) return { isKnown: true, name: link.name, url: link.url, category: 'Name Action', icon: 'fa-undo' };
            }
            if (session.url_type_input && session.url_type_input.includes('http')) {
                const link = links.find((l: any) => l.url === session.url_type_input);
                if (link) return { isKnown: true, name: link.name, url: link.url, category: 'Switch Action', icon: 'fa-exchange-alt' };
                return { isKnown: true, name: 'Custom Redirect', url: session.url_type_input, category: 'Switch Action', icon: 'fa-exchange-alt' };
            }
            if (session.type_input && !session.url_type_input) {
                return { isKnown: true, name: 'Text Input', url: 'Sending Text...', category: 'Quick Action', icon: 'fa-paper-plane' };
            }
        }
        
        let currentUrl = session.current_domain || '';
        const cleanCurrent = currentUrl.toLowerCase().replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('?')[0].replace(/\/$/, "");
        const matched = links.find((l: any) => {
            const cleanLink = l.url.toLowerCase().replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('?')[0].replace(/\/$/, "");
            return cleanCurrent.includes(cleanLink) || cleanLink.includes(cleanCurrent);
        });
        
        if (matched) return { isKnown: true, name: matched.name, url: matched.url, category: matched.category === 'switch_domain' || matched.category === 'type_input' ? 'Switch Action' : matched.category === 'again_domain' ? 'Name Action' : 'Quick Action', icon: 'fa-bullhorn' };
        return { isKnown: false, name: 'Active Session', url: currentUrl || 'No Active Link', category: 'External', icon: 'fa-globe' };
    }, [session, links]);

    return (
        <div className="p-3 bg-slate-50/50 dark:bg-slate-950/50">
            <ReceiveExternalInputData session={session} acknowledgedFields={acknowledgedFields} markFieldAsSeen={markFieldAsSeen} />
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-1 flex items-center gap-2">
                Live Traffic Monitor : <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </h4>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm flex flex-col md:flex-row items-center gap-3 transition-colors duration-300">
                <div className="flex items-center gap-2 shrink-0 px-2">
                    <span className="relative flex h-2.5 w-2.5">
                        {session.is_online && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${session.is_online ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${session.is_online ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-500'}`}>{session.is_online ? 'Live Connection' : 'Disconnected'}</span>
                </div>
                <div className="hidden md:block w-px h-5 bg-slate-200 dark:bg-slate-800"></div>
                <div className="shrink-0 flex items-center gap-1.5 px-2">
                    <i className={`fas ${activeLinkData.icon} ${session.is_online ? 'text-indigo-500' : 'text-slate-400'}`}></i>
                    <span className={`text-xs font-black uppercase tracking-wide ${session.is_online ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>{activeLinkData.category}</span>
                </div>
                <div className="hidden md:block w-px h-5 bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex-1 min-w-0 flex items-center gap-2 w-full md:w-auto bg-slate-50 dark:bg-slate-950/50 rounded-lg px-2 py-1 border border-slate-100 dark:border-slate-800/50">
                    <i className="fas fa-globe text-[10px] text-slate-400"></i>
                    <a href={activeLinkData.url} target="_blank" rel="noreferrer" className={`text-xs font-mono font-bold truncate transition-colors w-full ${session.is_online ? 'text-slate-700 dark:text-slate-200 hover:text-indigo-500' : 'text-slate-400 dark:text-slate-600'}`} title={activeLinkData.url}>{activeLinkData.url}</a>
                </div>
                <div className="hidden md:block w-px h-5 bg-slate-200 dark:bg-slate-800"></div>
                <div className="shrink-0 flex items-center gap-1.5 px-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Signal</span>
                    <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{new Date(session.last_active).toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
};

export default function Overview() {
    const { currentUser, users, visibleTrafficSessions, dashboardStats, links, handleRedirect, updateSessionTypeInput, toggleExpandSession, flushDashboardToHistory, showToast } = useStore();
    const [activeModal, setActiveModal] = useState<'link' | 'switch' | null>(null);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [acknowledgedFields, setAcknowledgedFields] = useState<Set<string>>(() => new Set(JSON.parse(localStorage.getItem('megatools_acks') || '[]')));
    const [customUrlValue, setCustomUrlValue] = useState('');
    const [showSavedLinks, setShowSavedLinks] = useState(false);
    const [savedLinks, setSavedLinks] = useState<{name: string, url: string}[]>(() => JSON.parse(localStorage.getItem('megatools_custom_links') || '[]'));
    const deleteSavedLink = (name: string) => {
        const newLinks = savedLinks.filter(l => l.name !== name);
        setSavedLinks(newLinks);
        localStorage.setItem('megatools_custom_links', JSON.stringify(newLinks));
    };
    const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
    const [newLinkData, setNewLinkData] = useState({ name: '', url: '' });
    const [now, setNow] = useState(Date.now());

    useEffect(() => { const t = setInterval(() => setNow(Date.now()), 10000); return () => clearInterval(t); }, []);
    useEffect(() => { localStorage.setItem('megatools_acks', JSON.stringify(Array.from(acknowledgedFields))); }, [acknowledgedFields]);

    const markAsSeen = (trafficId: string, field: string) => setAcknowledgedFields(prev => new Set(prev).add(`${trafficId}-${field}`));
    const isUnread = (trafficId: string, field: string, value: string | null) => {
        if (!value || field === 'ip' || field === 'agent') return false;
        return !acknowledgedFields.has(`${trafficId}-${field}`);
    };

    const copyAndMark = (session: Session, key: string, value: string | null) => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        markAsSeen(session.traffic_id, key);
        showToast('Copied', 'Data copied to clipboard', 'success');
    };

    const copyAgent = (session: Session) => {
        const agent = session.form_data['agent']?.value || 'Unknown Agent';
        navigator.clipboard.writeText(agent);
        showToast('Agent Copied', 'User Agent string copied to clipboard', 'success');
    };

    const isValidAgent = (agent: string | null | undefined) => {
        if (!agent || agent === 'null' || agent === '') return false;
        const demoAgents = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', 'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36', 'Mozilla/5.0 (iPad; CPU OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1'];
        return !demoAgents.includes(agent);
    };

    const getRelativeTime = (timestamp: number) => {
        const diff = Math.floor((now - timestamp) / 1000);
        if (diff < 60) return 'Just now';
        const m = Math.floor(diff / 60);
        if (m < 60) return `${m}m ago`;
        return `${Math.floor(m / 60)}h ago`;
    };

    const handleAgain = (session: Session) => { handleRedirect(session.traffic_id, 'again'); showToast(session.source_link_name || 'Campaign', 'Back redirected Success', 'success'); };
    const handleQuick = (session: Session) => {
        const val = (session.type_input || '').trim();
        const lowerVal = val.toLowerCase();
        let targetUrl: string | undefined;
        let categoryMatch: string | null = null;
        if (lowerVal === 'quick action') categoryMatch = 'other_domain';
        else if (lowerVal === 'name action') categoryMatch = 'again_domain';
        else if (lowerVal === 'switch action') categoryMatch = 'type_input';
        if (categoryMatch) {
            const link = links.find((l: any) => l.category === categoryMatch);
            if (link) targetUrl = link.url;
        }
        if (targetUrl) {
            handleRedirect(session.traffic_id, 'other', targetUrl, val);
            showToast(session.source_link_name || 'Campaign', `Redirecting to ${val}...`, 'success');
        } else {
            handleRedirect(session.traffic_id, 'type', undefined, val);
            showToast(session.source_link_name || 'Campaign', 'Quick input sent', 'success');
        }
    };

    const selectLink = (url: string, campaignName: string = 'Campaign') => {
        if (selectedSession) { handleRedirect(selectedSession.traffic_id, 'other', url); showToast(campaignName, 'Switch redirected Success', 'success'); }
        setActiveModal(null); setSelectedSession(null);
    };

    const saveCustomLink = () => {
        if (!newLinkData.name || !newLinkData.url) return;
        const newLinks = [...savedLinks, { ...newLinkData }];
        setSavedLinks(newLinks); localStorage.setItem('megatools_custom_links', JSON.stringify(newLinks));
        setIsAddLinkModalOpen(false); showToast('Success', 'Custom link saved', 'success');
    };

    const executeDirectRedirect = (url: string) => {
        if (selectedSession) {
            setCustomUrlValue(url); handleRedirect(selectedSession.traffic_id, 'other', url);
            showToast('Transfer Action', 'Custom redirect triggered', 'success');
            setActiveModal(null); setSelectedSession(null);
        }
    };

    const getSessionOwner = (session: Session) => users.find((u: any) => u.id === session.system_user_id);
    const getSessionRole = (session: Session) => getSessionOwner(session)?.role || 'User';

    const getThemeElement = (session: Session, type: string) => {
        const role = getSessionRole(session);
        if (role === 'Admin') {
            if (type === 'icon') return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700';
            if (type === 'badge') return 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700';
            if (type === 'solid') return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none';
            if (type === 'expanded') return 'bg-emerald-50/30 dark:bg-slate-800/30 border-emerald-100 dark:border-slate-800/50';
            if (type === 'bar') return 'bg-emerald-500';
        } else if (role === 'Moderator') {
            if (type === 'icon') return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700';
            if (type === 'badge') return 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700';
            if (type === 'solid') return 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200 dark:shadow-none';
            if (type === 'expanded') return 'bg-purple-50/30 dark:bg-slate-800/30 border-purple-100 dark:border-slate-800/50';
            if (type === 'bar') return 'bg-purple-500';
        } else {
            if (type === 'icon') return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700';
            if (type === 'badge') return 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700';
            if (type === 'solid') return 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-200 dark:shadow-none';
            if (type === 'expanded') return 'bg-cyan-50/30 dark:bg-slate-800/30 border-cyan-100 dark:border-slate-800/50';
            if (type === 'bar') return 'bg-cyan-500';
        }
        return '';
    };

    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar p-4">
            <div className="flex flex-col min-h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 font-sans animate-fade-in w-full transition-colors duration-300 transform-gpu">
                <div className="flex-none p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 rounded-t-2xl">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800"><i className="fas fa-id-badge mr-2"></i> Data View: {currentUser?.username || 'Guest'}</span>
                        {currentUser?.role === 'User' && <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Showing only your personal data</span>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col justify-between h-36 shadow-sm relative group">
                            <div className="flex items-center justify-between"><span className="text-xs font-black text-slate-400 uppercase tracking-widest">Mobile Click</span><div className="text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><i className="fas fa-mobile-alt text-lg"></i></div></div>
                            <span className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">{dashboardStats.total_mobile}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col justify-between h-36 shadow-sm relative group">
                            <div className="flex items-center justify-between"><span className="text-xs font-black text-slate-400 uppercase tracking-widest">Desktop Click</span><div className="text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><i className="fas fa-desktop text-lg"></i></div></div>
                            <span className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">{dashboardStats.total_desktop}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col justify-between h-36 shadow-sm relative group">
                            <div className="flex items-center justify-between"><span className="text-xs font-black text-slate-400 uppercase tracking-widest">Application Id</span><div className="text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><i className="fas fa-users text-lg"></i></div></div>
                            <span className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">{dashboardStats.total_traffic}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col justify-between h-36 shadow-sm relative group">
                            <div className="flex items-center justify-between"><span className="text-xs font-black text-slate-400 uppercase tracking-widest">External Data</span><div className="text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><i className="fas fa-database text-lg"></i></div></div>
                            <span className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">{dashboardStats.total_step_clicks}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-none px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row justify-between items-center bg-white dark:bg-slate-900 gap-4 shadow-sm">
                    <div className="flex items-center gap-3 w-full xl:w-auto">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shadow-sm shrink-0"><i className="fas fa-list-ul text-lg"></i></div>
                        <div><h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">Overview: Job Application Sessions Id List</h3></div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 sm:pb-0 justify-end">
                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-3 py-2 rounded-xl h-10 whitespace-nowrap">
                            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
                            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">{dashboardStats.active_now} Online</span>
                        </div>
                        <button onClick={() => { flushDashboardToHistory(); setAcknowledgedFields(new Set()); }} className="h-10 px-5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-200 dark:shadow-none active:scale-95 flex items-center gap-2 whitespace-nowrap"><i className="fas fa-trash-alt"></i> Clear</button>
                    </div>
                </div>

                <div className="flex-1 relative flex flex-col">
                    <div className="flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="py-4 px-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-left w-16">ID</th>
                                    <th className="py-4 px-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-left w-[240px]">Identity</th>
                                    <th className="py-4 px-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center w-28">Device</th>
                                    <th className="py-4 px-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center w-24">Status</th>
                                    <th className="py-4 px-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-left min-w-[220px]">Email</th>
                                    <th className="py-4 px-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-left min-w-[240px]">Name Action</th>
                                    <th className="py-4 px-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center min-w-[200px]">Quick Action</th>
                                    <th className="py-4 px-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center w-36">Agent</th>
                                    <th className="py-4 px-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center w-36">Switch</th>
                                    <th className="py-4 px-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center w-14">More</th>
                                    <th className="py-4 px-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center w-28">Transfer</th>
                                    <th className="py-4 px-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right w-28">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                {visibleTrafficSessions.map((session: Session) => {
                                    const owner = getSessionOwner(session);
                                    const role = getSessionRole(session);
                                    const rowClass = `hover:bg-opacity-80 transition-colors group transform-gpu will-change-transform border-l-4 ${session.is_expanded ? 'bg-gray-100 dark:bg-gray-800 border-gray-400' : role === 'Admin' ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-600' : role === 'Moderator' ? 'bg-purple-50/60 dark:bg-purple-900/10 border-purple-600' : 'bg-cyan-50/60 dark:bg-cyan-900/10 border-cyan-600'}`;
                                    const extraCount = Object.keys(session.form_data).filter(k => !['name', 'email', 'ip', 'agent'].includes(k) && session.form_data[k].value && isUnread(session.traffic_id, k, session.form_data[k].value)).length;

                                    return (
                                        <React.Fragment key={session.traffic_id}>
                                            <tr className={rowClass}>
                                                <td className="px-3 py-3 align-middle text-left">
                                                    <div className="relative w-full">
                                                        <span className={`font-mono font-bold text-xs px-2 py-1.5 rounded-lg border block w-fit shadow-sm ${getThemeElement(session, 'badge')}`}>#{session.sequential_id}</span>
                                                        {(isUnread(session.traffic_id, 'email', session.form_data['email'].value) || isUnread(session.traffic_id, 'name', session.form_data['name'].value)) && <span className="absolute -top-3 -right-2 z-10 inline-flex items-center justify-center bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-md border-2 border-white dark:border-slate-900 uppercase tracking-wider animate-pulse">NEW</span>}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex-none">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-md border-2 border-white dark:border-slate-700 bg-white ${!session.is_online ? 'text-slate-700' : ''}`}>{owner?.avatar || '?'}</div>
                                                            {session.is_online && <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`px-2.5 py-1.5 rounded-lg shadow-sm w-fit ${owner?.role === 'Admin' ? 'bg-rose-600' : 'bg-blue-600'}`}>
                                                                <div className="text-[9px] uppercase font-black tracking-widest text-white/90 leading-none mb-0.5">{owner?.role}</div>
                                                                <div className="text-xs font-black text-white leading-none tracking-tight">{owner?.username || 'Unknown'}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center align-middle">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all shadow-sm relative group/icon ${getThemeElement(session, 'icon')}`}><i className={`text-base ${session.device_os?.toLowerCase().includes('android') ? 'fab fa-android' : session.device_os?.toLowerCase().includes('ios') ? 'fab fa-apple' : session.device_os?.toLowerCase().includes('windows') ? 'fab fa-windows' : session.device_type === 'mobile' ? 'fas fa-mobile-alt' : 'fas fa-desktop'}`}></i></div>
                                                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm" title={session.browser}><i className={`text-base ${session.browser?.toLowerCase().includes('chrome') ? 'fab fa-chrome text-blue-500' : session.browser?.toLowerCase().includes('firefox') ? 'fab fa-firefox-browser text-orange-500' : session.browser?.toLowerCase().includes('safari') ? 'fab fa-safari text-blue-400' : session.browser?.toLowerCase().includes('edge') ? 'fab fa-edge text-teal-600' : 'fas fa-globe text-slate-400'}`}></i></div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center align-middle">
                                                    {session.is_online ? <span className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase border border-emerald-100 dark:border-emerald-800 shadow-sm"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> On</span> : <span className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black uppercase border border-slate-200 dark:border-slate-700 shadow-sm"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Off</span>}
                                                </td>
                                                <td className="px-3 py-3 align-middle">
                                                    <div className="relative">
                                                        <input type="text" readOnly value={session.form_data['email']?.value || ''} onClick={() => copyAndMark(session, 'email', session.form_data['email']?.value)} placeholder="No email..." className={`w-full h-12 border rounded-xl px-3 text-sm font-bold outline-none transition-all shadow-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 cursor-pointer ${isUnread(session.traffic_id, 'email', session.form_data['email']?.value) ? 'border-rose-500 dark:border-rose-500 ring-2 ring-rose-500' : 'border-slate-200 dark:border-slate-700'}`} title="Click to copy" />
                                                        {isUnread(session.traffic_id, 'email', session.form_data['email']?.value) && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500 animate-pulse pointer-events-none"></span>}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 align-middle">
                                                    <div className="flex items-center gap-0 w-full relative">
                                                        <input type="text" readOnly value={session.form_data['name']?.value || ''} onClick={() => copyAndMark(session, 'name', session.form_data['name']?.value)} placeholder="Pending Name..." className={`w-full h-12 border border-r-0 rounded-l-xl px-3 text-sm font-bold outline-none transition-all shadow-sm min-w-0 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 cursor-pointer ${isUnread(session.traffic_id, 'name', session.form_data['name']?.value) ? 'border-rose-500 dark:border-rose-500 ring-2 ring-rose-500' : 'border-slate-200 dark:border-slate-700'}`} title="Click to copy" />
                                                        <button onClick={() => handleAgain(session)} className={`w-12 flex-none h-12 rounded-r-xl text-white flex items-center justify-center transition-all shadow-md active:scale-95 z-10 ${getThemeElement(session, 'solid')}`} title="Redirect to Origin"><i className="fas fa-undo text-base"></i></button>
                                                        {isUnread(session.traffic_id, 'name', session.form_data['name']?.value) && <span className="absolute right-14 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500 animate-pulse pointer-events-none"></span>}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center align-middle">
                                                    <div className="flex items-center justify-center gap-0 w-full relative">
                                                        <input type="text" value={session.type_input} onChange={e => updateSessionTypeInput(session.traffic_id, e.target.value)} onClick={() => markAsSeen(session.traffic_id, 'type')} placeholder="Type text" className={`w-full h-12 text-sm font-bold border border-r-0 rounded-l-xl px-3 outline-none text-center shadow-sm min-w-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 ${isUnread(session.traffic_id, 'type', session.type_input) ? 'border-amber-500 dark:border-amber-500 ring-1 ring-amber-500' : 'border-slate-200 dark:border-slate-700'}`} />
                                                        <button onClick={() => handleQuick(session)} className={`w-12 flex-none h-12 rounded-r-xl text-white flex items-center justify-center transition-all shadow-md active:scale-95 z-10 ${getThemeElement(session, 'solid')}`} title="Quick Redirect"><i className="fas fa-paper-plane text-base"></i></button>
                                                        {isUnread(session.traffic_id, 'type', session.type_input) && <span className="absolute right-14 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 animate-pulse pointer-events-none"></span>}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center align-middle">
                                                    {isValidAgent(session.form_data['agent']?.value) ? (
                                                        <button onClick={() => copyAgent(session)} className="h-12 w-full px-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 border bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400"><i className="fas fa-copy"></i> <span>Copy Agent</span></button>
                                                    ) : <span className="text-slate-300 dark:text-slate-700 text-xs font-bold select-none">-</span>}
                                                </td>
                                                <td className="px-3 py-3 text-center align-middle">
                                                    <button onClick={() => { setSelectedSession(session); setActiveModal('link'); }} className={`h-12 w-full px-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 border ${role === 'Admin' ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-500' : role === 'Moderator' ? 'bg-purple-600 text-white border-purple-700 hover:bg-purple-500' : 'bg-cyan-600 text-white border-cyan-700 hover:bg-cyan-500'}`}><span>Switch</span> <i className="fas fa-external-link-alt text-[10px] opacity-50"></i></button>
                                                </td>
                                                <td className="px-3 py-3 text-center align-middle">
                                                    <button onClick={() => toggleExpandSession(session.traffic_id)} className={`relative h-9 w-9 mx-auto flex items-center justify-center transition-all rounded-xl border border-transparent transform-gpu will-change-transform ${getThemeElement(session, 'icon')}`}>
                                                        <i className={`fas fa-chevron-down text-sm transform transition-transform duration-300 ${session.is_expanded ? 'rotate-180' : ''}`}></i>
                                                        {extraCount > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black h-6 w-6 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-md z-10 animate-bounce">{extraCount}</span>}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-3 text-center align-middle">
                                                    <button onClick={() => { setSelectedSession(session); setActiveModal('switch'); setCustomUrlValue(''); }} className="h-12 w-full px-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 border bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"><i className="fas fa-random"></i> <span>Transfer</span></button>
                                                </td>
                                                <td className="px-3 py-3 text-right align-middle">
                                                    {session.deletionTargetTime && session.countdownString ? <span className="inline-block bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-black px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-800 shadow-sm whitespace-nowrap animate-pulse">{session.countdownString}</span> : <span className="inline-block text-slate-400 dark:text-slate-500 text-xs font-bold whitespace-nowrap">{getRelativeTime(session.first_data_time)}</span>}
                                                </td>
                                            </tr>
                                            {session.is_expanded && (
                                                <tr className={`animate-fade-in border-b relative ${getThemeElement(session, 'expanded')}`}>
                                                    <td colSpan={12} className="p-0">
                                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getThemeElement(session, 'bar')}`}></div>
                                                        <OverviewDropdown session={session} acknowledgedFields={acknowledgedFields} markFieldAsSeen={(f: string) => markAsSeen(session.traffic_id, f)} />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                {visibleTrafficSessions.length === 0 && (
                                    <tr>
                                        <td colSpan={12} className="p-0 border-0">
                                            <div className="h-[400px] w-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-50/30 dark:bg-slate-900/30">
                                                <div className="relative z-10 flex flex-col items-center">
                                                    <div className="relative mb-6">
                                                        <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
                                                        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-500 animate-spin"></div>
                                                        <div className="absolute inset-0 flex items-center justify-center"><i className="fas fa-satellite-dish text-indigo-500 dark:text-indigo-400 text-lg animate-pulse"></i></div>
                                                    </div>
                                                    <h3 className="text-lg font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Scanning for Traffic</h3>
                                                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                                                        <div className="flex gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-200"></span></div>
                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Waiting for real-time data...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {activeModal === 'link' && selectedSession && (
                    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal(null)}>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-modal-slide-in relative border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setActiveModal(null)} className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><i className="fas fa-times text-base"></i></button>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-3">Switch Action</h2>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {links.filter((l: any) => l.category === 'type_input').map((link: any) => (
                                    <button key={link.id} onClick={() => selectLink(link.url, link.name)} className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-left transition-all">
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{link.name}</div>
                                        <div className="text-xs text-slate-400">{link.url}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeModal === 'switch' && selectedSession && (
                    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => { setActiveModal(null); setShowSavedLinks(false); }}>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-modal-slide-in relative border border-slate-200 dark:border-slate-800 overflow-visible" onClick={e => e.stopPropagation()}>
                            <button onClick={() => { setActiveModal(null); setShowSavedLinks(false); }} className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><i className="fas fa-times text-base"></i></button>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">Transfer Action</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-4">Redirect this session to a custom URL</p>
                            <div className="flex gap-2 mb-4">
                                <button onClick={() => setIsAddLinkModalOpen(true)} className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95 shrink-0 shadow-sm" title="Add Custom Link"><i className="fas fa-plus text-base"></i></button>
                                <div className="flex-1 relative group">
                                    {showSavedLinks && <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowSavedLinks(false)}></div>}
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 z-20"><i className="fas fa-random"></i></div>
                                    <input type="text" value={customUrlValue} onChange={e => setCustomUrlValue(e.target.value)} onFocus={() => setShowSavedLinks(true)} onClick={() => setShowSavedLinks(true)} onKeyDown={e => e.key === 'Enter' && executeDirectRedirect(customUrlValue)} placeholder="Enter Custom URL..." className="relative z-50 w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all shadow-sm" />
                                    {showSavedLinks && savedLinks.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar ring-1 ring-slate-900/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-100">
                                            {savedLinks.map(link => (
                                                <div key={link.name} className="flex items-center justify-between px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-b border-slate-50 dark:border-slate-800/50 last:border-0 group/item transition-colors cursor-pointer">
                                                    <button onClick={() => executeDirectRedirect(link.url)} className="flex-1 text-left flex flex-col min-w-0">
                                                        <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide truncate group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">{link.name}</span>
                                                        <span className="text-[10px] text-slate-400 truncate">{link.url}</span>
                                                    </button>
                                                    <button onClick={() => deleteSavedLink(link.name)} className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all ml-2" title="Delete Link"><i className="fas fa-trash-alt text-xs"></i></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 flex gap-2 items-start">
                                <i className="fas fa-info-circle text-indigo-500 mt-0.5"></i>
                                <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed">Enter a URL and press Enter to instantly redirect the user. Use the <b>+</b> button to save frequently used links for quick access.</p>
                            </div>
                        </div>
                    </div>
                )}

                {isAddLinkModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsAddLinkModalOpen(false)}>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-modal-slide-in relative border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                            <h3 className="text-base font-black text-slate-800 dark:text-white mb-3">Add Custom Link</h3>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Link Name</label>
                                    <input type="text" value={newLinkData.name} onChange={e => setNewLinkData({...newLinkData, name: e.target.value})} placeholder="e.g. YouTube Video" className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target URL</label>
                                    <input type="text" value={newLinkData.url} onChange={e => setNewLinkData({...newLinkData, url: e.target.value})} placeholder="https://..." className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors" />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setIsAddLinkModalOpen(false)} className="flex-1 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                <button onClick={saveCustomLink} className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95">Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}