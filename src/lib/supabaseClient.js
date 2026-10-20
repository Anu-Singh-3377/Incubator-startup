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
const DEFAULT_COMPLIANCE_DOCS = [
  {
    id: 'doc_01',
    document_type: 'Certificate of Incorporation',
    document_name: 'Certificate of Incorporation (MCA / RoC)',
    mandatory: true,
    status: 'Verified',
    uploaded_at: '2026-01-20T10:00:00Z',
    file_name: 'COI_Certificate_RoC_Delhi.pdf',
    notes: 'Verified against MCA21 master registry.'
  },
  {
    id: 'doc_02',
    document_type: 'MCA Registration',
    document_name: 'MoA & AoA (Charter Documents)',
    mandatory: true,
    status: 'Verified',
    uploaded_at: '2026-01-22T14:30:00Z',
    file_name: 'MoA_AoA_Signed_Copies.pdf',
    notes: 'Director shareholding matches cap table.'
  },
  {
    id: 'doc_03',
    document_type: 'PAN / Tax ID',
    document_name: 'Company PAN & GST Registration',
    mandatory: true,
    status: 'Verified',
    uploaded_at: '2026-02-05T09:15:00Z',
    file_name: 'PAN_GSTIN_TaxCert.pdf',
    notes: 'GSTIN active on CBIC portal.'
  },
  {
    id: 'doc_04',
    document_type: 'DPIIT Certificate',
    document_name: 'DPIIT Startup Recognition Certificate',
    mandatory: false,
    status: 'Verified',
    uploaded_at: '2026-02-18T16:00:00Z',
    file_name: 'DPIIT_Recognition_Cert.pdf',
    notes: 'Eligible for Section 80-IAC tax holiday & SISFS.'
  },
  {
    id: 'doc_05',
    document_type: 'Audited UC',
    document_name: 'Audited Utilization Certificate (UC) - Tranche 1',
    mandatory: true,
    status: 'Under Review',
    uploaded_at: '2026-10-14T11:45:00Z',
    file_name: 'UC_Tranche1_CA_Certified.pdf',
    notes: 'Submitted for verification by incubation audit committee.'
  }
];

let localStartupsCache = [
  {
    id: 'st_01',
    startup_name: 'KisanSetu DeepTech Labs',
    legal_name: 'KisanSetu Innovations Private Limited',
    dpiit_number: 'DIPP-IN-98214',
    mca_number: 'U72900DL2025PTC384910',
    incorporation_date: '2025-04-18',
    incorporation_status: 'Incorporated (Pvt Ltd)',
    sector: 'AgriTech & Edge AI',
    cohort: 'Cohort 12 (Spring 2026)',
    stage: 'Incubated',
    status: 'Active',
    company_overview: 'Autonomous precision edge sensors and satellite telemetry designed to optimize crop yield and water usage for Indian smallholder farmers.',
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
    created_at: '2026-01-15T10:00:00Z',
    documents: DEFAULT_COMPLIANCE_DOCS
  },
  {
    id: 'st_02',
    startup_name: 'NeuraMed Diagnostics',
    legal_name: 'NeuraMed BioTechnologies Pvt Ltd',
    dpiit_number: 'DIPP-IN-11203',
    mca_number: 'U73100KA2025PTC412093',
    incorporation_date: '2025-06-22',
    incorporation_status: 'Incorporated (Pvt Ltd)',
    sector: 'HealthTech & BioSensors',
    cohort: 'Cohort 12 (Spring 2026)',
    stage: 'Incubated',
    status: 'Active',
    company_overview: 'Point-of-care rapid blood diagnostic microfluidics device delivering complete CBC and biochemistry reports in under 12 minutes in remote healthcare facilities.',
    founder_name: 'Dr. Priya Varma',
    founder_email: 'priya@neuramed.in',
    founder_phone: '+91 98111 44552',
    pitch_deck_url: 'https://example.com/pitch/neuramed.pdf',
    sanctioned_grant: 3000000,
    disbursed_grant: 1500000,
    grant_scheme: 'DST NIDHI-PRAYAS',
    assigned_mentor: 'Prof. S. K. Ramanathan',
    lab_access: 'Biotech Wet Lab Suite 2',
    milestone_progress: 70,
    created_at: '2026-02-01T12:00:00Z',
    documents: DEFAULT_COMPLIANCE_DOCS.map((d, i) => i === 4 ? { ...d, status: 'Verified' } : d)
  },
  {
    id: 'st_03',
    startup_name: 'ChargeBharat EV Grid',
    legal_name: 'ChargeBharat Mobility Pvt Ltd',
    dpiit_number: 'DIPP-IN-09843',
    mca_number: 'U34100MH2024PTC390118',
    incorporation_date: '2024-11-05',
    incorporation_status: 'Incorporated (Pvt Ltd)',
    sector: 'CleanTech & Energy',
    cohort: 'Cohort 11 (Autumn 2025)',
    stage: 'Accelerated',
    status: 'Active',
    company_overview: 'Grid-resilient modular DC fast-charging stations integrated with local solar battery storage tailored for Tier-2 and Tier-3 Indian highway corridors.',
    founder_name: 'Ankit Deshmukh',
    founder_email: 'ankit@chargebharat.com',
    founder_phone: '+91 99345 67890',
    pitch_deck_url: 'https://example.com/pitch/chargebharat.pdf',
    sanctioned_grant: 4500000,
    disbursed_grant: 3500000,
    grant_scheme: 'MeitY TIDE 2.0 & SISFS',
    assigned_mentor: 'Vikram Joshi (Angel Investor)',
    lab_access: 'High Voltage Power Lab',
    milestone_progress: 85,
    created_at: '2025-09-10T14:30:00Z',
    documents: DEFAULT_COMPLIANCE_DOCS.map(d => ({ ...d, status: 'Verified' }))
  },
  {
    id: 'st_04',
    startup_name: 'DronaVimana Aerospace',
    legal_name: 'DronaVimana Defense & Drone Systems Pvt Ltd',
    dpiit_number: 'DIPP-IN-07421',
    mca_number: 'U35300KA2023PTC368291',
    incorporation_date: '2023-08-14',
    incorporation_status: 'Incorporated (Pvt Ltd)',
    sector: 'DeepTech & Aerospace',
    cohort: 'Cohort 10 (Spring 2025)',
    stage: 'Graduated',
    status: 'Alumni',
    company_overview: 'Long-range tethered UAV surveillance platforms for border security and disaster management. Successfully raised ₹18 Cr Series A post graduation from incubator.',
    founder_name: 'Capt. Raghuveer Nair (Retd.)',
    founder_email: 'raghu@dronavimana.in',
    founder_phone: '+91 98450 11992',
    pitch_deck_url: 'https://example.com/pitch/dronavimana.pdf',
    sanctioned_grant: 5000000,
    disbursed_grant: 5000000,
    grant_scheme: 'DST NIDHI-EIR & SISFS',
    assigned_mentor: 'Air Marshal S. Sen (Retd.)',
    lab_access: 'Graduated (Honorary Lab Fellow)',
    milestone_progress: 100,
    created_at: '2025-01-20T09:00:00Z',
    documents: DEFAULT_COMPLIANCE_DOCS.map(d => ({ ...d, status: 'Verified' }))
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

  // Startups List (for Incubator Dashboard & Portfolio Management)
  async getStartups() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          // Map database records and attach default document checklist if missing
          return data.map((item) => ({
            ...item,
            status: item.status || (item.stage === 'Graduated' ? 'Alumni' : 'Active'),
            documents: item.documents || DEFAULT_COMPLIANCE_DOCS
          }));
        }
      } catch (err) {
        console.warn('[Supabase] Falling back to portfolio cache:', err.message);
      }
    }
    return localStartupsCache;
  },

  // Add Startup (Live Supabase insert with local state sync)
  async addStartup(startupData) {
    const formattedData = {
      startup_name: startupData.startup_name.trim(),
      legal_name: startupData.legal_name || `${startupData.startup_name} Private Limited`,
      founder_name: startupData.founder_name.trim(),
      founder_phone: startupData.founder_phone.trim(),
      founder_email: startupData.founder_email ? startupData.founder_email.trim() : `founder@${startupData.startup_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`,
      company_overview: startupData.company_overview ? startupData.company_overview.trim() : 'Innovative startup in active incubation phase.',
      sector: startupData.sector || 'DeepTech & AI',
      status: startupData.status || 'Active',
      stage: startupData.status === 'Alumni' ? 'Graduated' : (startupData.stage || 'Incubated'),
      mca_number: startupData.mca_number ? startupData.mca_number.trim() : null,
      incorporation_date: startupData.incorporation_date || null,
      incorporation_status: startupData.incorporation_status || 'Incorporated (Pvt Ltd)',
      dpiit_number: startupData.dpiit_number || `DIPP-IN-${Math.floor(10000 + Math.random() * 90000)}`,
      cohort: startupData.cohort || 'Cohort 12 (Spring 2026)',
      sanctioned_grant: Number(startupData.sanctioned_grant) || 2500000,
      disbursed_grant: Number(startupData.disbursed_grant) || 0,
      grant_scheme: startupData.grant_scheme || 'Startup India Seed Fund Scheme (SISFS)',
      assigned_mentor: startupData.assigned_mentor || 'Mentorship Board Pending Allocation',
      lab_access: startupData.lab_access || 'General Co-working & Hardware Bay',
      milestone_progress: startupData.status === 'Alumni' ? 100 : 25,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('startups')
          .insert([formattedData])
          .select()
          .single();

        if (error) {
          console.error('[Supabase Error] addStartup failed:', error);
          throw error;
        }

        const enriched = {
          ...data,
          status: data.status || formattedData.status,
          documents: DEFAULT_COMPLIANCE_DOCS
        };
        localStartupsCache = [enriched, ...localStartupsCache];
        return { success: true, startup: enriched, isDatabase: true };
      } catch (err) {
        // If column error or permission error, throw with clear message
        throw new Error(err.message || 'Database insert failed.');
      }
    }

    // Demo Mode execution
    const newEntry = {
      ...formattedData,
      id: `st_${Date.now()}`,
      documents: DEFAULT_COMPLIANCE_DOCS
    };
    localStartupsCache = [newEntry, ...localStartupsCache];
    return { success: true, startup: newEntry, isDatabase: false };
  },

  // Update Startup Record
  async updateStartup(id, updatedFields) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('startups')
          .update({
            ...updatedFields,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        localStartupsCache = localStartupsCache.map((s) => (s.id === id ? { ...s, ...data } : s));
        return { success: true, startup: data, isDatabase: true };
      } catch (err) {
        throw new Error(err.message || 'Database update failed.');
      }
    }

    // Demo Mode update
    localStartupsCache = localStartupsCache.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          ...updatedFields,
          updated_at: new Date().toISOString()
        };
      }
      return s;
    });

    const updated = localStartupsCache.find((s) => s.id === id);
    return { success: true, startup: updated, isDatabase: false };
  },

  // Delete Startup Record
  async deleteStartup(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('startups')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        throw new Error(err.message || 'Database delete failed.');
      }
    }

    localStartupsCache = localStartupsCache.filter((s) => s.id !== id);
    return { success: true };
  },

  // Get Compliance Documents for a Startup
  async getDocuments(startupId) {
    const startup = localStartupsCache.find((s) => s.id === startupId);
    return startup?.documents || DEFAULT_COMPLIANCE_DOCS;
  },

  // Update Compliance Document Status
  async updateDocumentStatus(startupId, docId, newStatus, notes) {
    localStartupsCache = localStartupsCache.map((s) => {
      if (s.id === startupId) {
        const updatedDocs = (s.documents || DEFAULT_COMPLIANCE_DOCS).map((d) => {
          if (d.id === docId) {
            return {
              ...d,
              status: newStatus,
              verified_at: newStatus === 'Verified' ? new Date().toISOString() : d.verified_at,
              notes: notes || d.notes
            };
          }
          return d;
        });
        return { ...s, documents: updatedDocs };
      }
      return s;
    });

    return { success: true };
  },

  // Applications List (for Cohort Pipeline)
  async getApplications() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('cohort_applications')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (err) {
        console.warn('Error reading cohort_applications:', err.message);
      }
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

  // Announcements List
  async getAnnouncements() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('incubation_announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (err) {
        console.warn('Error reading announcements:', err.message);
      }
    }
    return MOCK_ANNOUNCEMENTS;
  },

  // Post Announcement
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
