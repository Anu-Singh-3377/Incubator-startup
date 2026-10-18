import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if valid Supabase configuration is present
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-public-key') &&
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial pre-seeded mock database for zero-config evaluation
const MOCK_STARTUPS = [
  {
    id: 'st_01',
    startup_name: 'KisanSetu DeepTech Labs',
    legal_name: 'KisanSetu Innovations Private Limited',
    dpiit_number: 'DIPP-IN-98214',
    sector: 'AgriTech & Edge AI',
    cohort: 'Cohort 12 (Spring 2026)',
    stage: 'Incubated',
    founder_name: 'Aarav Sharma',
    founder_email: 'founder@venturebharat.in',
    founder_phone: '+91 98765 43210',
    pitch_deck_url: 'https://example.com/pitch/kisansetu.pdf',
    sanctioned_grant: 2500000,
    disbursed_grant: 1250000,
    grant_scheme: 'Startup India Seed Fund Scheme (SISFS)',
    assigned_mentor: 'Dr. Radhika Iyer (IIT Bombay Alum)',
    lab_access: 'IoT Cleanroom Bay 4B & 3D Prototyping',
    milestone_progress: 55,
    milestones: [
      { id: 'm1', name: 'Ideation & Due Diligence', status: 'Completed', date: 'Jan 2026' },
      { id: 'm2', name: 'Sensor Hardware Prototyping', status: 'In Progress', date: 'April 2026' },
      { id: 'm3', name: 'Field Pilot in Maharashtra Farms', status: 'Upcoming', date: 'July 2026' },
      { id: 'm4', name: 'Tranche 2 Grant Review', status: 'Upcoming', date: 'Sept 2026' }
    ]
  },
  {
    id: 'st_02',
    startup_name: 'NeuraMed Diagnostics',
    legal_name: 'NeuraMed BioTechnologies Pvt Ltd',
    dpiit_number: 'DIPP-IN-11203',
    sector: 'HealthTech & BioSensors',
    cohort: 'Cohort 12 (Spring 2026)',
    stage: 'Incubated',
    founder_name: 'Dr. Priya Varma',
    founder_email: 'priya@neuramed.in',
    founder_phone: '+91 98111 44552',
    sanctioned_grant: 3000000,
    disbursed_grant: 1500000,
    grant_scheme: 'DST NIDHI-PRAYAS',
    assigned_mentor: 'Prof. S. K. Ramanathan',
    lab_access: 'Biotech Wet Lab Suite 2',
    milestone_progress: 70
  },
  {
    id: 'st_03',
    startup_name: 'ChargeBharat EV Grid',
    legal_name: 'ChargeBharat Mobility Pvt Ltd',
    dpiit_number: 'DIPP-IN-09843',
    sector: 'CleanTech & Energy',
    cohort: 'Cohort 11 (Autumn 2025)',
    stage: 'Accelerated',
    founder_name: 'Ankit Deshmukh',
    founder_email: 'ankit@chargebharat.com',
    founder_phone: '+91 99345 67890',
    sanctioned_grant: 4500000,
    disbursed_grant: 3500000,
    grant_scheme: 'MeitY TIDE 2.0 & SISFS',
    assigned_mentor: 'Vikram Joshi (Angel Investor)',
    lab_access: 'High Voltage Power Lab',
    milestone_progress: 85
  }
];

const MOCK_APPLICATIONS = [
  {
    id: 'app_01',
    startup_name: 'AgroSense Robotics',
    founder_name: 'Pooja Nair',
    founder_email: 'pooja@agrosense.in',
    founder_phone: '+91 98223 44556',
    sector: 'AgriTech & Robotics',
    cohort_name: 'Cohort 13 (Autumn 2026)',
    dpiit_number: 'DIPP-10492',
    pitch_summary: 'Autonomous precision spraying drones with edge AI weed detection for Indian farms.',
    status: 'Under Review',
    evaluation_score: 88,
    review_notes: 'Demonstrated working payload at Nashik agricultural pilot.'
  },
  {
    id: 'app_02',
    startup_name: 'KavachBio Defense',
    founder_name: 'Maj. R. K. Singhal (Retd.)',
    founder_email: 'singhal@kavachbio.in',
    founder_phone: '+91 98980 11223',
    sector: 'DefenceTech & NanoMaterials',
    cohort_name: 'Cohort 13 (Autumn 2026)',
    dpiit_number: 'DIPP-14029',
    pitch_summary: 'Lightweight ceramic ballistic armour infused with graphene nano-composites.',
    status: 'Interview Scheduled',
    evaluation_score: 94,
    review_notes: 'High strategic value. Board interview confirmed for Thursday.'
  },
  {
    id: 'app_03',
    startup_name: 'FinSetu UPI Protocol',
    founder_name: 'Devendra Patel',
    founder_email: 'devendra@finsetu.co',
    founder_phone: '+91 97766 55443',
    sector: 'FinTech & Open Networks',
    cohort_name: 'Cohort 13 (Autumn 2026)',
    dpiit_number: 'DIPP-15220',
    pitch_summary: 'Offline UPI soundbox transactions via localized ultrasound mesh transmission.',
    status: 'Accepted',
    evaluation_score: 91,
    review_notes: 'Sanctioned for ₹20 Lakh SISFS grant and co-working incubation.'
  }
];

const MOCK_ANNOUNCEMENTS = [
  {
    id: 'anc_01',
    title: 'Startup India Seed Fund Scheme (SISFS) Tranche 2 Submissions Open',
    content: 'All Cohort 12 startups with 100% prototype completion can submit Utilization Certificates (UC) before the 30th of this month.',
    category: 'Grant',
    priority: 'high',
    posted_by: 'Col. Vikramaditya Rathore (CEO)',
    created_at: '2026-10-15T10:00:00Z'
  },
  {
    id: 'anc_02',
    title: 'DeepTech & IoT Cleanroom Lab Upgraded with 5-Axis CNC & SMT Benches',
    content: 'Hardware startups can book the upgraded cleanroom facility directly from their dashboard.',
    category: 'Lab',
    priority: 'normal',
    posted_by: 'AIC Lab Directorate',
    created_at: '2026-10-12T14:30:00Z'
  },
  {
    id: 'anc_03',
    title: 'Demo Day Pitch Session with Bharat Angel Network',
    content: 'Scheduled for upcoming Friday at 3:00 PM IST. 4 shortlisted startups will present to 12 angel investors.',
    category: 'Event',
    priority: 'normal',
    posted_by: 'Programs & Partnerships',
    created_at: '2026-10-10T09:15:00Z'
  }
];

// Unified Supabase Service
export const supabaseService = {
  // Sign In with email & password
  async signIn({ email, password, role }) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Fetch user profile from public.profiles
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileErr && profileErr.code !== 'PGRST116') {
        console.warn('Profile fetch note:', profileErr.message);
      }

      const userRole = profile?.role || data.user.user_metadata?.role || role || 'startup';

      // Check role enforcement if selected on UI
      if (role && role !== userRole) {
        throw new Error(
          `Access restricted: This account is registered as '${userRole.toUpperCase()}', not '${role.toUpperCase()}'. Please select the matching login tab.`
        );
      }

      const activeUser = {
        id: data.user.id,
        email: data.user.email,
        role: userRole,
        full_name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
        phone: profile?.phone || data.user.user_metadata?.phone || '+91 98765 43210',
        designation: profile?.designation,
        organization: profile?.organization,
        isSupabase: true
      };

      localStorage.setItem('vb_active_user', JSON.stringify(activeUser));
      return { success: true, user: activeUser };
    }

    // Demo Mode fallback for immediate testing
    const demoAccounts = {
      'founder@venturebharat.in': {
        id: 'usr_founder_01',
        email: 'founder@venturebharat.in',
        role: 'startup',
        full_name: 'Aarav Sharma',
        phone: '+91 98765 43210',
        startup_name: 'KisanSetu DeepTech Labs',
        dpiit_number: 'DIPP-IN-98214',
        sector: 'AgriTech & Edge AI',
        cohort: 'Cohort 12 (Spring 2026)',
        designation: 'Founder & CEO',
        isSupabase: false
      },
      'admin@venturebharat.in': {
        id: 'usr_admin_01',
        email: 'admin@venturebharat.in',
        role: 'admin',
        full_name: 'Col. Vikramaditya Rathore',
        phone: '+91 99000 11223',
        designation: 'CEO & Incubation Director',
        organization: 'VentureBharat Incubation Foundation (AIM/DST)',
        isSupabase: false
      }
    };

    const target = demoAccounts[email.toLowerCase().trim()];
    if (!target) {
      // Allow custom email with role
      const customUser = {
        id: 'usr_' + Date.now(),
        email: email.trim(),
        role: role || 'startup',
        full_name: email.split('@')[0],
        phone: '+91 98765 43210',
        startup_name: 'Indian Innovation Labs',
        sector: 'DeepTech',
        cohort: 'Cohort 12',
        isSupabase: false
      };
      localStorage.setItem('vb_active_user', JSON.stringify(customUser));
      return { success: true, user: customUser };
    }

    if (role && role !== target.role) {
      throw new Error(
        `Access restricted: This account is registered as '${target.role.toUpperCase()}', not '${role.toUpperCase()}'.`
      );
    }

    localStorage.setItem('vb_active_user', JSON.stringify(target));
    return { success: true, user: target };
  },

  // Sign up for new startup
  async signUpStartup({ email, password, full_name, phone, startup_name, sector, dpiit_number }) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            phone,
            role: 'startup',
            startup_name,
            sector,
            dpiit_number
          }
        }
      });

      if (error) throw error;

      const newUser = {
        id: data.user.id,
        email: data.user.email,
        role: 'startup',
        full_name,
        phone,
        startup_name,
        sector,
        dpiit_number,
        isSupabase: true
      };

      localStorage.setItem('vb_active_user', JSON.stringify(newUser));
      return { success: true, user: newUser, data };
    }

    // Demo Mode registration
    const newUser = {
      id: 'usr_' + Date.now(),
      email,
      role: 'startup',
      full_name,
      phone,
      startup_name: startup_name || 'InnovateBharat Technologies',
      sector: sector || 'DeepTech & AI',
      dpiit_number: dpiit_number || 'DIPP-' + Math.floor(10000 + Math.random() * 90000),
      cohort: 'Cohort 13 (Autumn 2026)',
      sanctioned_grant: 2500000,
      disbursed_grant: 0,
      isSupabase: false
    };

    localStorage.setItem('vb_active_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  // Sign Out
  async signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem('vb_active_user');
  },

  // Get Current Session User
  async getCurrentUser() {
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        return {
          id: session.user.id,
          email: session.user.email,
          role: profile?.role || session.user.user_metadata?.role || 'startup',
          full_name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          phone: profile?.phone || session.user.user_metadata?.phone,
          isSupabase: true
        };
      }
    }

    try {
      const stored = localStorage.getItem('vb_active_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Startups List (for Admin Dashboard)
  async getStartups() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('startups')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    }
    return MOCK_STARTUPS;
  },

  // Applications List (for Admin Dashboard)
  async getApplications() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('cohort_applications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    }
    return MOCK_APPLICATIONS;
  },

  // Update Application Status (e.g. Accept, Reject)
  async updateApplicationStatus(id, newStatus, notes) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('cohort_applications')
        .update({ status: newStatus, review_notes: notes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
    return { id, status: newStatus, review_notes: notes };
  },

  // Announcements List (for both Dashboards)
  async getAnnouncements() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('incubation_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    }
    return MOCK_ANNOUNCEMENTS;
  },

  // Post Announcement (Admin Dashboard)
  async postAnnouncement(title, content, category = 'Event', priority = 'normal') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('incubation_announcements')
        .insert([{ title, content, category, priority }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
    return {
      id: 'anc_' + Date.now(),
      title,
      content,
      category,
      priority,
      posted_by: 'Incubation Operations',
      created_at: new Date().toISOString()
    };
  }
};

