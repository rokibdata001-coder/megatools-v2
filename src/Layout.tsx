import React, { useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useStore } from "./store";

const NotificationContainer = () => {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="fixed top-6 right-6 z-[100] w-full max-w-[380px] pointer-events-none flex flex-col gap-2">
      {toasts.map((toast, i) => (
        <div key={toast.id} className={`transition-all duration-500 ease-in-out transform pointer-events-auto ${i === 0 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 -translate-y-4'} ${i > 2 ? 'invisible' : ''}`}>
          <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-start gap-4 border-l-8 ${toast.type === 'success' ? 'border-l-emerald-500' : toast.type === 'error' ? 'border-l-rose-500' : toast.type === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl ${toast.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : toast.type === 'error' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : toast.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
              {toast.type === 'success' ? <i className="fas fa-check"></i> : toast.type === 'error' ? <i className="fas fa-exclamation"></i> : toast.type === 'warning' ? <i className="fas fa-exclamation-triangle"></i> : <i className="fas fa-info"></i>}
            </div>
            <div className="flex-1 pt-1 min-w-0">
              <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wide leading-none mb-1 truncate">{toast.title}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-tight line-clamp-2 break-words">{toast.message}</p>
            </div>
            <button onClick={() => dismissToast(toast.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"><i className="fas fa-times"></i></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Layout() {
  const { currentUser, isDarkMode, toggleTheme, navigation, unlockAudio } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const sidebarNav = navigation.filter((n: any) => n.position === 'sidebar');

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200" onClick={unlockAudio}>
      <NotificationContainer />

      {/* Sidebar */}
      <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ease-in-out flex flex-col shrink-0 h-full z-30 ${isSidebarExpanded ? 'w-72' : 'w-16'}`}>
        <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-slate-100 dark:border-slate-800">
          <div className={`flex items-center gap-3 overflow-hidden whitespace-nowrap ${!isSidebarExpanded ? 'hidden' : ''}`}>
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 dark:shadow-none uppercase text-lg shrink-0">M</div>
            <span className="font-black text-slate-800 dark:text-slate-100 text-xl tracking-tight truncate">Megatools</span>
          </div>
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all active:scale-95 ml-auto">
            <i className={`fas text-base ${isSidebarExpanded ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {[
            { path: '/overview', icon: '📊', label: 'Overview' },
            { path: '/history', icon: '📜', label: 'My History' },
            { path: '/campaign', icon: '🌐', label: 'External URL' },
            { path: '/testing-link', icon: '🧪', label: 'Testing Lab' }
          ].map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200 group relative overflow-hidden ${location.pathname.includes(item.path) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}>
              <span className="text-lg shrink-0 w-7 text-center">{item.icon}</span>
              <span className={`font-bold text-sm whitespace-nowrap transition-all duration-200 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>{item.label}</span>
              {!isSidebarExpanded && <div className="hidden group-hover:block absolute left-12 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">{item.label}</div>}
            </Link>
          ))}
          {sidebarNav.length > 0 && <div className="py-3 px-3"><div className="h-px bg-slate-200 dark:bg-slate-800 w-full"></div></div>}
          {sidebarNav.map((nav: any) => nav.type === 'direct' ? (
            <Link key={nav.id} to={`/view/single/${nav.id}`} className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200 group relative overflow-hidden ${location.pathname.includes(nav.id) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}>
              <span className="text-lg shrink-0 w-7 text-center">{nav.icon}</span>
              <span className={`font-bold text-sm whitespace-nowrap transition-all duration-200 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>{nav.label}</span>
            </Link>
          ) : (
            <div key={nav.id} className="space-y-1 relative group">
              <button onClick={() => toggleGroup(nav.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200 relative overflow-hidden ${expandedGroups.has(nav.id) ? 'bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-transparent' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <span className="text-lg shrink-0 w-7 text-center">{nav.icon}</span>
                <span className={`font-bold text-sm flex-1 text-left whitespace-nowrap transition-all duration-200 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>{nav.label}</span>
                {isSidebarExpanded && <span className={`text-xs transition-transform duration-200 text-slate-400 ${expandedGroups.has(nav.id) ? 'rotate-180' : ''}`}>▼</span>}
              </button>
              {isSidebarExpanded && expandedGroups.has(nav.id) && (
                <div className="pl-9 space-y-1 animate-in slide-in-from-top-2 duration-150">
                  {nav.items.map((page: any) => (
                    <Link key={page.id} to={`/view/page/${nav.id}/${page.id}`} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${location.pathname.includes(page.id) ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <span className="text-base shrink-0">{page.icon}</span>
                      <span className="font-bold text-xs truncate">{page.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50/50 dark:bg-slate-950/50 relative">
        <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-20 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-6 flex-1 overflow-hidden">
            <div className="flex items-center gap-3 shrink-0">
              <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate capitalize">{location.pathname.split('/').pop() || 'Overview'}</h1>
              {currentUser.role === 'Admin' && (
                <Link to="/workflow" className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center gap-2">
                  <i className="fas fa-network-wired"></i> Workflow
                </Link>
              )}
              <Link to="/browser" className="w-9 h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95"><i className="fas fa-globe text-base"></i></Link>
            </div>
          </div>
          <div className="flex items-center gap-3 relative shrink-0">
            <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-amber-400 transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 relative overflow-hidden group">
              <i className={`fas text-base absolute transition-all duration-200 transform ${!isDarkMode ? 'fa-moon opacity-100' : 'fa-sun text-amber-400 opacity-0 rotate-90 scale-0'}`}></i>
              <i className={`fas text-base absolute transition-all duration-200 transform text-amber-400 ${isDarkMode ? 'fa-sun opacity-100' : 'fa-moon opacity-0 -rotate-90 scale-0'}`}></i>
            </button>
            
            {/* Profile button */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-lg hover:scale-105 transition-transform shadow-md"
              >
                {currentUser?.avatar || '👤'}
              </button>
              
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">@{currentUser?.username}</p>
                      <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase mt-1">{currentUser?.role}</p>
                    </div>
                    
                    <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <i className="fas fa-user-cog w-5 text-indigo-500"></i>
                      <span>Settings</span>
                    </Link>
                    
                    <Link to="/manage-page" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <i className="fas fa-pager w-5 text-emerald-500"></i>
                      <span>Manage Page</span>
                    </Link>
                    
                    <Link to="/manage-referral" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <i className="fas fa-user-plus w-5 text-purple-500"></i>
                      <span>Manage Referral</span>
                    </Link>
                    
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                    
                    <Link to="/logout" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                      <i className="fas fa-sign-out-alt w-5"></i>
                      <span>Logout</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 relative overflow-auto flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}