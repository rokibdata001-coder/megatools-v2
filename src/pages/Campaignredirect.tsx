import React, { useState, useRef } from 'react';
import { useStore } from '../store';

// ==================== TestingLink Component ====================
export const TestingLink = () => {
    const { currentUser, getUserTrackingCode, showToast } = useStore();
    const [internalLog, setInternalLog] = useState('');

    const simulateInternalVisit = () => {
        const myId = currentUser ? getUserTrackingCode(currentUser) : 'DEMO';
        const profiles = [
            { deviceType: 'mobile', os: 'Android', browser: 'Chrome Mobile', agent: 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36' },
            { deviceType: 'mobile', os: 'iOS', browser: 'Safari Mobile', agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1' },
            { deviceType: 'desktop', os: 'Windows', browser: 'Chrome', agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
        ];
        const profile = profiles[Math.floor(Math.random() * profiles.length)];
        const randomIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        
        window.postMessage({
            type: 'VISIT', ownerId: myId, deviceType: profile.deviceType, sessionId: 'TEST-' + Math.floor(Math.random() * 100000), isNew: true,
            tech: { landing: 'https://simulator.megatools.io/test', agent: profile.agent, ip: randomIp, referrer: 'Direct' }
        }, '*');

        setInternalLog(`Generated: ${profile.os} using ${profile.browser} (IP: ${randomIp})`);
        showToast('Visitor Sent', `New ${profile.deviceType} visitor simulated`, 'success');
        setTimeout(() => setInternalLog(''), 4000);
    };

    return (
        <div className="h-full w-full p-6 bg-slate-950 font-mono text-slate-300">
            <div className="max-w-4xl mx-auto flex flex-col gap-8 h-full">
                <div className="text-center space-y-4 pt-10">
                    <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 animate-pulse"><i className="fas fa-satellite-dish text-4xl text-white"></i></div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Traffic Simulator</h2>
                    <p className="text-slate-400 max-w-lg mx-auto">Generate dynamic visitor data instantly. No popups, no external tabs.</p>
                </div>
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><i className="fas fa-network-wired text-9xl text-white"></i></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">One-Click Visitor</h3>
                        <p className="text-slate-400 mb-8 max-w-md text-sm">Clicking the button below will simulate a new user arriving at your site with a unique IP, Device, and Browser footprint.</p>
                        <button onClick={simulateInternalVisit} className="group relative h-20 px-10 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-xl uppercase tracking-widest shadow-xl shadow-emerald-900/50 transition-all active:scale-95 flex items-center justify-center gap-4 w-full sm:w-auto overflow-hidden">
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            <i className="fas fa-paper-plane text-2xl group-hover:rotate-12 transition-transform duration-300"></i> <span>Send Live Visit</span>
                        </button>
                        {internalLog && (
                            <div className="mt-8 w-full max-w-lg bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-500/30 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                                <div className="mt-0.5 text-emerald-400"><i className="fas fa-check-circle"></i></div>
                                <div className="text-left"><p className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">Signal Injected Successfully</p><p className="text-slate-400 text-[10px] font-mono leading-relaxed">{internalLog}</p></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== Browser Component ====================
export const Browser = () => {
    const [urlInput, setUrlInput] = useState('https://www.google.com/webhp?igu=1');
    const [currentUrl, setCurrentUrl] = useState('https://www.google.com/webhp?igu=1');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const navigate = () => {
        let url = urlInput.trim();
        if (!url) return;
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
        setUrlInput(url); setCurrentUrl(url);
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-slate-900">
            <div className="flex-none h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 gap-3 z-20">
                <div className="flex items-center gap-1"><button onClick={() => iframeRef.current && (iframeRef.current.src = iframeRef.current.src)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg transition-all"><i className="fas fa-sync-alt text-xs"></i></button></div>
                <div className="flex-1 h-9 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center px-3 transition-all group focus-within:ring-2 focus-within:ring-indigo-500/10">
                    <div className="w-6 flex items-center justify-center text-slate-300 group-focus-within:text-emerald-500 transition-colors"><i className="fas fa-globe text-[10px]"></i></div>
                    <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && navigate()} className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-600 dark:text-slate-300 h-full" placeholder="Enter website URL..." />
                    <button onClick={navigate} className="px-3 h-6 bg-white dark:bg-slate-700 text-indigo-600 rounded text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow active:scale-95 transition-all">Go</button>
                </div>
                <button onClick={() => window.open(urlInput, '_blank')} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"><i className="fas fa-external-link-alt text-xs"></i></button>
            </div>
            <div className="flex-1 relative w-full h-full bg-white dark:bg-slate-950 overflow-hidden">
                <iframe ref={iframeRef} src={currentUrl} className="absolute inset-0 w-full h-full border-none block z-10 bg-white dark:bg-slate-950" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-presentation" allowFullScreen></iframe>
            </div>
        </div>
    );
};

// ==================== Workflow Component ====================
export const Workflow = () => {
    return (
        <div className="h-full w-full p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Workflows</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Your Workflows</h2>
                    <div className="space-y-4">
                        <div className="border border-gray-200 dark:border-slate-700 rounded p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer">
                            <div><h3 className="font-medium text-gray-800 dark:text-slate-200">Lead Qualification</h3><p className="text-sm text-gray-500">Runs daily at 9:00 AM</p></div><span className="h-3 w-3 rounded-full bg-green-500"></span>
                        </div>
                        <div className="border border-gray-200 dark:border-slate-700 rounded p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer">
                            <div><h3 className="font-medium text-gray-800 dark:text-slate-200">Welcome Sequence</h3><p className="text-sm text-gray-500">Triggered on Sign Up</p></div><span className="h-3 w-3 rounded-full bg-green-500"></span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 flex flex-col items-center justify-center min-h-[300px] bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700">
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">Select a workflow</h3><p className="mt-1 text-sm text-gray-500">View detailed steps and logic.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};