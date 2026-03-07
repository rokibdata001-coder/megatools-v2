import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store';
import { SingleButton, NavGroup } from '../store/types';

export const DynamicIframe = () => {
    const { id, groupId, pageId } = useParams();
    const { navigation, isDarkMode } = useStore();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    const target = useMemo(() => {
        if (id) return navigation.find((n: any) => n.id === id && n.type === 'direct') as SingleButton;
        if (groupId && pageId) {
            const group = navigation.find((n: any) => n.id === groupId && n.type === 'dropdown') as NavGroup;
            return group?.items.find((p: any) => p.id === pageId);
        }
        return null;
    }, [id, groupId, pageId, navigation]);

    useEffect(() => { setIsLoading(true); }, [id, groupId, pageId]);

    useEffect(() => {
        if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ theme: isDarkMode ? 'dark' : 'light' }, '*');
    }, [isDarkMode, isLoading]);

    if (!target) return <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 bg-white dark:bg-slate-900 animate-fade-in p-6"><span className="text-6xl">🔍</span><h2 className="text-xl font-bold">Content Not Found</h2></div>;

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-slate-950 font-sans relative overflow-hidden group">
            <div className="absolute top-3 right-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                    <button onClick={() => { setIsLoading(true); if (iframeRef.current) iframeRef.current.src = iframeRef.current.src; }} className="w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-md transition-all active:scale-95"><i className="fas fa-sync-alt text-[10px]"></i></button>
                    <button onClick={() => window.open(target.url, '_blank')} className="w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-md transition-all active:scale-95"><i className="fas fa-external-link-alt text-[10px]"></i></button>
                </div>
            </div>
            <div className="flex-1 relative w-full h-full bg-white dark:bg-slate-950">
                {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-950 z-10"><div className="w-10 h-10 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div></div>}
                <iframe ref={iframeRef} src={target.url} onLoad={() => setIsLoading(false)} className="w-full h-full border-none block" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation"></iframe>
            </div>
        </div>
    );
}