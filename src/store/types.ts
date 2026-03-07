export type UserRole = 'Admin' | 'Moderator' | 'User';
export type NavPosition = 'sidebar' | 'topbar';
export type UserStatus = 'Active' | 'Pending' | 'Blocked';
export type CampaignCategory = 'switch_domain' | 'other_domain' | 'type_input' | 'again_domain';
export type FilterType = 'All' | 'Mobile' | 'Desktop';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface User { 
  id: string; 
  username: string; 
  name: string; 
  email: string; 
  phone: string; 
  facebook: string; 
  password: string; 
  role: UserRole; 
  status: UserStatus; 
  referrer_id: string | null; 
  referral_code: string; 
  avatar: string; 
  avatar_color: string; 
  joined: string; 
}

export interface NavItem { 
  id: string; 
  name: string; 
  url: string; 
  icon: string; 
  access: 'private' | 'team' | 'specific'; 
  mode: 'iframe' | 'new_tab' | 'popup'; 
  short_key: string; 
}

export interface NavGroup { 
  id: string; 
  label: string; 
  icon: string; 
  type: 'dropdown'; 
  position: NavPosition; 
  items: NavItem[]; 
}

export interface SingleButton { 
  id: string; 
  label: string; 
  url: string; 
  icon: string; 
  type: 'direct'; 
  position: NavPosition; 
  access: 'private' | 'team' | 'specific'; 
  mode: 'iframe' | 'new_tab' | 'popup'; 
}

export type NavElement = NavGroup | SingleButton;

export interface TrafficLink { 
  id: string; 
  name: string; 
  url: string; 
  category: CampaignCategory; 
  filterType?: FilterType; 
  owner_id?: string; 
  access_scope?: 'global' | 'private'; 
}

export interface SessionFormData { 
  [key: string]: { 
    value: string | null; 
    source_page: string; 
  }; 
}

export interface Session { 
  sequential_id: number; 
  traffic_id: string; 
  system_user_id: string; 
  first_entry_domain: string; 
  current_domain: string; 
  current_page: string; 
  current_step_name: string; 
  role: string; 
  username: string; 
  profile_img: string; 
  device_type: 'mobile' | 'desktop'; 
  device_os: string; 
  browser: string; 
  today_clicks: number; 
  source_link_id: string; 
  source_link_name: string; 
  is_online: boolean; 
  last_active: number; 
  total_steps: number; 
  current_step: number; 
  step_progress: number; 
  is_viewed: boolean; 
  has_ever_been_viewed: boolean; 
  first_data_time: number; 
  form_data: SessionFormData; 
  status: string; 
  signal: string; 
  url_type_input: string; 
  type_input: string; 
  created_at: number; 
  updated_at: number; 
  is_expanded: boolean; 
  is_pinned: boolean; 
  seen: boolean; 
  deletionTargetTime: number | null; 
  countdownString?: string | null; 
  target_stage: number; 
  awaiting_reentry?: boolean; 
  cleared_by?: string[]; 
}

export interface ToastMessage { 
  id: number; 
  type: NotificationType; 
  title: string; 
  message: string; 
  duration?: number; 
}

export interface TrafficEvent { 
  type: 'VISIT' | 'INPUT'; 
  payload: any; 
  timestamp: number; 
}