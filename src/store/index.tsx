import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { User, NavElement, Session, TrafficLink, ToastMessage, TrafficEvent } from './types';
import { useStoreActions } from './actions';

const DEFAULT_USERS: User[] = [
    { 
      id: 'u-rakib', 
      username: 'rakib', 
      name: 'Rakib', 
      email: 'rakib@gmail.com', 
      phone: '+8801700000000', 
      facebook: 'https://facebook.com/rakib', 
      password: 'rakib', 
      role: 'Admin', 
      status: 'Active', 
      referrer_id: null, 
      referral_code: 'tm892', 
      avatar: '👨‍💻', 
      avatar_color: 'bg-emerald-600', 
      joined: new Date().toISOString() 
    },
    { 
      id: 'u-sohag', 
      username: 'sohag', 
      name: 'Sohag', 
      email: 'sohag@gmail.com', 
      phone: '+8801700000001', 
      facebook: 'https://facebook.com/sohag', 
      password: 'sohag', 
      role: 'Moderator', 
      status: 'Active', 
      referrer_id: 'u-rakib', 
      referral_code: 'zdwe8z', 
      avatar: '👮‍♂️', 
      avatar_color: 'bg-purple-600', 
      joined: new Date().toISOString() 
    },
    { 
      id: 'u-alamin', 
      username: 'alamin', 
      name: 'Alamin', 
      email: 'alamin@gmail.com', 
      phone: '+8801700000002', 
      facebook: 'https://facebook.com/alamin', 
      password: 'alamin', 
      role: 'User', 
      status: 'Active', 
      referrer_id: 'u-sohag', 
      referral_code: 'us101', 
      avatar: '🧑', 
      avatar_color: 'bg-blue-600', 
      joined: new Date().toISOString() 
    }
];

const DEFAULT_NAV: NavElement[] = [{ id: 'grp_official', label: 'Official Links', icon: '🏢', type: 'dropdown', position: 'sidebar', items: [{ id: 'pg_portfolio', name: 'Portfolio', url: 'https://viewpost.my.id/portfolio', icon: '🎨', access: 'private', mode: 'iframe', short_key: '' }, { id: 'pg_blog', name: 'Blog', url: 'https://viewpost.my.id/blog', icon: '📝', access: 'private', mode: 'iframe', short_key: '' }] }];
const DEFAULT_LINKS: TrafficLink[] = [{ id: 'lnk_sw_1', name: 'Special Offer', url: 'https://520-654-3251.com/', category: 'type_input', access_scope: 'global' }, { id: 'lnk_sw_2', name: 'Bonus Page', url: 'https://520-654-3251.com/', category: 'type_input', access_scope: 'global' }, { id: 'lnk_nm_1', name: 'Profile Update', url: 'https://520-654-3251.org/', category: 'again_domain', access_scope: 'global' }, { id: 'lnk_qk_1', name: 'Number Verify', url: 'https://520-654-3251.info/', category: 'other_domain', access_scope: 'global' }];

export const StoreContext = createContext<any>(null);
export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
    const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('megatools_users') || 'null') || DEFAULT_USERS);
    const [navigation, setNavigation] = useState<NavElement[]>(() => JSON.parse(localStorage.getItem('megatools_nav') || 'null') || DEFAULT_NAV);
    const [sessions, setSessions] = useState<Session[]>(() => JSON.parse(localStorage.getItem('megatools_sessions') || 'null') || []);
    const [history, setHistory] = useState<Session[]>(() => JSON.parse(localStorage.getItem('megatools_history') || 'null') || []);
    const [links, setLinks] = useState<TrafficLink[]>(() => JSON.parse(localStorage.getItem('megatools_links') || 'null') || DEFAULT_LINKS);
    
    const [currentUser, setCurrentUser] = useState<User | null>(() => JSON.parse(localStorage.getItem('megatools_session') || 'null'));
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('megatools_theme') === 'dark');
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [latestEvent, setLatestEvent] = useState<TrafficEvent | null>(null);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const isAudioUnlockedRef = useRef(false);

    useEffect(() => { localStorage.setItem('megatools_users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('megatools_nav', JSON.stringify(navigation)); }, [navigation]);
    useEffect(() => { localStorage.setItem('megatools_sessions', JSON.stringify(sessions)); }, [sessions]);
    useEffect(() => { localStorage.setItem('megatools_history', JSON.stringify(history)); }, [history]);
    useEffect(() => { localStorage.setItem('megatools_links', JSON.stringify(links)); }, [links]);
    useEffect(() => { 
        if (currentUser) localStorage.setItem('megatools_session', JSON.stringify(currentUser)); 
        else localStorage.removeItem('megatools_session');
    }, [currentUser]);
    useEffect(() => { 
        localStorage.setItem('megatools_theme', isDarkMode ? 'dark' : 'light'); 
        if (isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDarkMode]);

    useEffect(() => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioCtxRef.current = new AudioContext();
            masterGainRef.current = audioCtxRef.current.createGain();
            masterGainRef.current.connect(audioCtxRef.current.destination);
            masterGainRef.current.gain.value = 1.0;
        } catch (e) { console.error('Web Audio API not supported'); }
    }, []);

    const unlockAudio = () => {
        if (isAudioUnlockedRef.current || !audioCtxRef.current) return;
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume().then(() => { isAudioUnlockedRef.current = true; });
        } else { isAudioUnlockedRef.current = true; }
    };

    const playOscillator = (freq: number, type: OscillatorType, start: number, duration: number, vol: number) => {
        if (!audioCtxRef.current || !masterGainRef.current) return;
        const o = audioCtxRef.current.createOscillator();
        const g = audioCtxRef.current.createGain();
        o.type = type; o.frequency.value = freq;
        o.connect(g); g.connect(masterGainRef.current);
        g.gain.setValueAtTime(vol, start);
        g.gain.exponentialRampToValueAtTime(0.01, start + duration);
        o.start(start); o.stop(start + duration);
    };

    const playRingtone = (type: 'mobile' | 'desktop' | 'session' | 'input' | 'error' | 'success') => {
        if (!audioCtxRef.current || !masterGainRef.current) return;
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        const now = audioCtxRef.current.currentTime;
        switch (type) {
            case 'mobile':
                playOscillator(880, 'square', now, 0.15, 0.3); playOscillator(880, 'square', now + 0.2, 0.4, 0.3);
                playOscillator(880, 'square', now + 1.0, 0.15, 0.3); playOscillator(880, 'square', now + 1.2, 0.4, 0.3);
                playOscillator(1760, 'sine', now + 2.0, 0.5, 0.2); break;
            case 'desktop':
                playOscillator(500, 'sawtooth', now, 0.05, 0.2); playOscillator(520, 'sawtooth', now + 0.05, 0.05, 0.2);
                playOscillator(500, 'sawtooth', now + 0.1, 0.05, 0.2); playOscillator(520, 'sawtooth', now + 0.15, 0.05, 0.2);
                playOscillator(500, 'sawtooth', now + 1.5, 0.05, 0.2); playOscillator(520, 'sawtooth', now + 1.55, 0.05, 0.2);
                playOscillator(500, 'sawtooth', now + 1.6, 0.05, 0.2); playOscillator(520, 'sawtooth', now + 1.65, 0.05, 0.2); break;
            case 'session':
                const osc = audioCtxRef.current.createOscillator(); const gain = audioCtxRef.current.createGain();
                osc.connect(gain); gain.connect(masterGainRef.current);
                osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
                gain.gain.setValueAtTime(0.5, now); gain.gain.linearRampToValueAtTime(0, now + 1.5);
                osc.start(now); osc.stop(now + 1.5); break;
            case 'input':
                playOscillator(1200, 'square', now, 0.05, 0.3); playOscillator(600, 'square', now + 0.05, 0.1, 0.2); break;
            case 'success':
                playOscillator(800, 'sine', now, 0.2, 0.3); playOscillator(1200, 'sine', now + 0.2, 0.4, 0.3); break;
            case 'error':
                playOscillator(150, 'sawtooth', now, 0.5, 0.5); break;
        }
    };

    useEffect(() => {
        const channel = new BroadcastChannel('megatools_universal_api');
        channel.onmessage = (event) => {
            if (event.data && event.data.type) {
                actions.handleIncomingTraffic(event.data);
                setLatestEvent({ type: event.data.type, payload: event.data, timestamp: Date.now() });
            }
        };
        const handleWindowMessage = (event: MessageEvent) => {
            const data = event.data;
            if (data && (data.type === 'VISIT' || data.type === 'INPUT')) {
                actions.handleIncomingTraffic(data);
                setLatestEvent({ type: data.type, payload: data, timestamp: Date.now() });
                if (event.source && (event.source as any).postMessage) {
                    (event.source as any).postMessage({ type: 'ACK', status: 'Received' }, '*');
                }
            }
        };
        window.addEventListener('message', handleWindowMessage);
        
        if (window.opener) {
            let attempts = 0;
            const handshakeInterval = setInterval(() => {
                if (window.opener) {
                    window.opener.postMessage({ type: 'DASHBOARD_READY' }, '*');
                    window.opener.postMessage('DASHBOARD_READY', '*');
                } else clearInterval(handshakeInterval);
                attempts++;
                if (attempts >= 10) clearInterval(handshakeInterval);
            }, 500);
        }

        return () => { channel.close(); window.removeEventListener('message', handleWindowMessage); };
    }, []);

    const actions = useStoreActions(
        users, setUsers,
        navigation, setNavigation,
        sessions, setSessions,
        history, setHistory,
        links, setLinks,
        currentUser, setCurrentUser,
        setToasts,
        setLatestEvent,
        playRingtone
    );

    useEffect(() => {
        if (!latestEvent) return;
        if (Date.now() - latestEvent.timestamp > 2000) return;
        if (latestEvent.type === 'VISIT') {
            playRingtone('session'); actions.showToast('New Connection', 'External device connected to dashboard', 'success');
        } else if (latestEvent.type === 'INPUT') {
            const key = latestEvent.payload.key;
            if (key !== 'ip' && key !== 'agent') {
                playRingtone('input');
                const title = (key === 'name' || key === 'email') ? `Received ${key.toUpperCase()}` : 'Data Received';
                actions.showToast(title, `${key}: ${latestEvent.payload.value}`, 'info');
            }
        }
    }, [latestEvent]);

    const visibleTrafficHistory = useMemo(() => {
        return actions.visibleTrafficHistory();
    }, [sessions, history, currentUser, users]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const value = {
        users,
        navigation,
        sessions,
        history,
        links,
        currentUser,
        isDarkMode,
        toasts,
        latestEvent,
        visibleTrafficSessions: actions.visibleTrafficSessions,
        dashboardStats: actions.dashboardStats,
        visibleTrafficHistory,
        visibleTrafficLinks: actions.visibleTrafficLinks,
        login: actions.login,
        logout: actions.logout,
        register: actions.register,
        updateProfile: actions.updateProfile,
        updateUsername: actions.updateUsername,
        updatePassword: actions.updatePassword,
        approveUser: actions.approveUser,
        blockUser: actions.blockUser,
        deleteUser: actions.deleteUser,
        updateUserStatus: actions.updateUserStatus,
        flushDashboardToHistory: actions.flushDashboardToHistory,
        handleRedirect: actions.handleRedirect,
        updateSessionTypeInput: actions.updateSessionTypeInput,
        toggleExpandSession: actions.toggleExpandSession,
        addTrafficLink: actions.addTrafficLink,
        updateTrafficLink: actions.updateTrafficLink,
        deleteTrafficLink: actions.deleteTrafficLink,
        updateNavigation: actions.updateNavigation,
        deleteNav: actions.deleteNav,
        getUserTrackingCode: actions.getUserTrackingCode,
        getReferralLink: actions.getReferralLink,
        getUserLoginLink: actions.getUserLoginLink,
        toggleTheme,
        showToast: actions.showToast,
        dismissToast: actions.dismissToast,
        unlockAudio,
        playRingtone
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
};