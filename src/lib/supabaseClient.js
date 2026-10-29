import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || '';

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

if (typeof window !== 'undefined') {
  if (isSupabaseConfigured) {
    console.info(`[VentureBharat Auth] Connected to live Supabase backend: ${supabaseUrl}`);
  } else {
    console.warn(
      '[VentureBharat Auth] Supabase is not configured.\n' +
      '-> Live Supabase keys (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not configured in your .env file.\n' +
      '-> Password authentication and registration are disabled until Supabase credentials are configured.\n' +
      '-> Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env and restart the app.'
    );
  }
}

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

// ================= STAKEHOLDERS: INVESTORS MOCK =================
const MOCK_INVESTORS = [
  {
    id: 'inv_01',
    fund_name: 'Bharat Seed Ventures',
    investor_type: 'Venture Capital Fund',
    contact_name: 'Vikram Gupta',
    email: 'vikram@bharatseed.vc',
    phone: '+91 98110 54321',
    website_url: 'https://bharatseed.vc',
    linkedin_url: 'https://linkedin.com/in/vikramgupta-vc',
    focus_sectors: 'DeepTech & AI, AgriTech, CleanTech',
    preferred_stage: 'Seed',
    investment_range: '₹1 Crore - ₹5 Crore',
    preferred_geography: 'India / Pan-India',
    relationship_status: 'Active Partner',
    internal_notes: 'Lead investor for 2 alumni ventures; prefers deep IP & patents filed.',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-18T12:00:00Z'
  },
  {
    id: 'inv_02',
    fund_name: 'Anicut Angel Syndicate',
    investor_type: 'Syndicate',
    contact_name: 'Meenakshi Sundaram',
    email: 'meenakshi@anicutangels.in',
    phone: '+91 98401 99882',
    website_url: 'https://anicutangels.in',
    linkedin_url: 'https://linkedin.com/in/meenakshi-sundaram',
    focus_sectors: 'AgriTech & Robotics, BioSensors',
    preferred_stage: 'Pre-seed',
    investment_range: '₹25 Lakh - ₹75 Lakh',
    preferred_geography: 'South & Western India',
    relationship_status: 'Active Partner',
    internal_notes: 'Fast decision maker; regularly participates in quarterly Demo Days.',
    created_at: '2026-02-14T11:30:00Z',
    updated_at: '2026-10-12T09:30:00Z'
  },
  {
    id: 'inv_03',
    fund_name: 'Inflection Point Ventures (IPV)',
    investor_type: 'Angel Investor',
    contact_name: 'Vinay Bansal',
    email: 'deals@ipventures.in',
    phone: '+91 98200 44321',
    website_url: 'https://ipventures.in',
    linkedin_url: 'https://linkedin.com/company/inflection-point-ventures',
    focus_sectors: 'HealthTech, Hardware, Industry 4.0',
    preferred_stage: 'Seed',
    investment_range: '₹50 Lakh - ₹2 Crore',
    preferred_geography: 'Pan-India',
    relationship_status: 'Active Partner',
    internal_notes: 'Looking for ventures with established hospital pilot testing.',
    created_at: '2026-03-01T15:00:00Z',
    updated_at: '2026-09-20T14:15:00Z'
  },
  {
    id: 'inv_04',
    fund_name: 'Blume Founders Fund',
    investor_type: 'Venture Capital Fund',
    contact_name: 'Sajith Pai',
    email: 'sajith@blume.vc',
    phone: '+91 99000 12345',
    website_url: 'https://blume.vc',
    linkedin_url: 'https://linkedin.com/in/sajithpai',
    focus_sectors: 'B2B SaaS, FinTech, Aerospace',
    preferred_stage: 'Seed',
    investment_range: '₹2 Crore - ₹8 Crore',
    preferred_geography: 'India / Global',
    relationship_status: 'Network Member',
    internal_notes: 'Evaluates graduates ready for institutional Series Seed rounds.',
    created_at: '2026-04-10T12:00:00Z',
    updated_at: '2026-10-01T16:00:00Z'
  },
  {
    id: 'inv_05',
    fund_name: 'Indian Angel Network (IAN)',
    investor_type: 'Angel Investor',
    contact_name: 'Padmaja Ruparel',
    email: 'padmaja@indianangelnetwork.com',
    phone: '+91 98100 88776',
    website_url: 'https://indianangelnetwork.com',
    linkedin_url: 'https://linkedin.com/in/padmajaruparel',
    focus_sectors: 'CleanTech, Open Networks, BioMed',
    preferred_stage: 'Pre-seed',
    investment_range: '₹25 Lakh - ₹1 Crore',
    preferred_geography: 'Pan-India',
    relationship_status: 'Prospective',
    internal_notes: 'MOU renewal pending with directorate for upcoming cohort demo day.',
    created_at: '2026-05-18T10:00:00Z',
    updated_at: '2026-08-11T11:00:00Z'
  }
];

// ================= STAKEHOLDERS: MENTORS MOCK =================
const MOCK_MENTORS = [
  {
    id: 'mnt_01',
    full_name: 'Dr. Radhika Iyer',
    designation: 'Partner & Chief Scientific Officer',
    organization: 'Bharat Seed & Ex-IIT Bombay',
    email: 'radhika.iyer@iitbombay.ac.in',
    phone: '+91 98205 12345',
    areas_of_expertise: 'Edge AI Sensors, Embedded Systems, Precision AgriTech',
    industry_skills: 'Hardware Architecture, Microelectronics, Patent Drafting',
    mentoring_topics: 'FPGA optimization, field telemetry trials, seed grant compliance',
    availability: 'Bi-weekly Office Hours',
    mentoring_format: 'Hybrid (Virtual & In-Person)',
    linkedin_url: 'https://linkedin.com/in/dr-radhika-iyer',
    bio: '20+ years of research in sensor micro-fabrication. Lead investigator for multiple DST NIDHI projects and technical advisor to 14 hardware startups.',
    internal_notes: 'Assigned to KisanSetu DeepTech Labs; excellent feedback from founders.',
    status: 'Active',
    created_at: '2026-01-05T09:00:00Z',
    updated_at: '2026-10-15T10:00:00Z'
  },
  {
    id: 'mnt_02',
    full_name: 'Prof. K. S. Narayanan',
    designation: 'Distinguished Professor & Former Director',
    organization: 'CSIR-NCL Pune',
    email: 'ks.narayanan@csir-alumni.in',
    phone: '+91 98900 66778',
    areas_of_expertise: 'Chemical Process Engineering, Biomaterials, CleanTech',
    industry_skills: 'Scale-up engineering, safety protocols, statutory pollution clearances',
    mentoring_topics: 'Pilot plant setup, green hydrogen storage, technology transfer',
    availability: 'Monthly',
    mentoring_format: 'Virtual Mentoring',
    linkedin_url: 'https://linkedin.com/in/prof-ks-narayanan',
    bio: 'Former Director at CSIR; recipient of Shanti Swarup Bhatnagar Prize. Mentors biomaterial and clean energy startups.',
    internal_notes: 'Available for deep technical audits and BIRAC grant reviews.',
    status: 'Active',
    created_at: '2026-01-12T11:00:00Z',
    updated_at: '2026-09-18T14:00:00Z'
  },
  {
    id: 'mnt_03',
    full_name: 'Sunil K. Agrawal',
    designation: 'Advisor - Avionics & Mission Systems',
    organization: 'Ex-ISRO Satellite Center',
    email: 'sunil.agrawal@aerospace-mentors.in',
    phone: '+91 98450 77123',
    areas_of_expertise: 'Aerospace Telemetry, RF Systems, High-Reliability Firmware',
    industry_skills: 'MIL-STD testing, vibration profiling, RTOS systems',
    mentoring_topics: 'Drone DGCA certification, autonomous fail-safe design, tethered UAVs',
    availability: 'Weekly',
    mentoring_format: 'In-Person at Cleanroom Bay',
    linkedin_url: 'https://linkedin.com/in/sunil-agrawal-isro',
    bio: 'Guided payload engineering for 6 ISRO launches. Now chairs the incubator’s technical advisory panel for defence and aerospace.',
    internal_notes: 'Helped DronaVimana achieve DGCA type certification.',
    status: 'Active',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-10-02T16:00:00Z'
  },
  {
    id: 'mnt_04',
    full_name: 'Pooja Sengupta',
    designation: 'Managing Partner',
    organization: 'LexBharat Tech Legal Associates',
    email: 'pooja.sengupta@lexbharat.in',
    phone: '+91 98111 23456',
    areas_of_expertise: 'Tech IPR, Founder Cap-table Agreements, MCA21 Compliance',
    industry_skills: 'IP Licensing, Cross-border structuring, ESOP policy formulation',
    mentoring_topics: 'Reverse vesting, convertible notes, DPIIT tax exemption appeals',
    availability: 'Bi-weekly Office Hours',
    mentoring_format: 'Virtual Mentoring',
    linkedin_url: 'https://linkedin.com/in/pooja-sengupta-law',
    bio: 'Corporate technology lawyer representing over 80 funded Indian startups. Regular contributor to Startup India regulatory consultations.',
    internal_notes: 'Provides complimentary 1-hour legal clinic for all new incubatees.',
    status: 'Active',
    created_at: '2026-02-10T12:00:00Z',
    updated_at: '2026-10-10T11:00:00Z'
  },
  {
    id: 'mnt_05',
    full_name: 'Rohan Deshmukh',
    designation: 'VP Enterprise Products',
    organization: 'Scaler Labs & Angel Investor',
    email: 'rohan.deshmukh@scalerlabs.in',
    phone: '+91 97690 99881',
    areas_of_expertise: 'B2B Enterprise GTM, SaaS Pricing, Enterprise Sales',
    industry_skills: 'Product Management, Customer Discovery, ARR Growth',
    mentoring_topics: 'Pilot to paid contract conversion, positioning, sales compensation',
    availability: 'Monthly',
    mentoring_format: 'Hybrid (Virtual & In-Person)',
    linkedin_url: 'https://linkedin.com/in/rohan-deshmukh-product',
    bio: 'Scaled 2 B2B enterprise SaaS startups from zero to $5M ARR. Angel investor in 9 tech startups across Bangalore and NCR.',
    internal_notes: 'Specializes in preparing founders for commercial enterprise pilots.',
    status: 'Active',
    created_at: '2026-03-05T14:00:00Z',
    updated_at: '2026-09-25T15:00:00Z'
  }
];

// ================= STAKEHOLDERS: APPROVED VENDORS MOCK =================
const MOCK_VENDORS = [
  {
    id: 'vnd_01',
    company_name: 'Amazon Web Services (AWS Activate)',
    service_category: 'Cloud Computing',
    description: 'Leading cloud infrastructure provider offering scalable compute, AI/ML instances, and enterprise databases.',
    contact_person: 'Amitav Roy (Startup Ecosystem Manager)',
    contact_email: 'activate-india@amazon.com',
    contact_phone: '+91 80 4000 5000',
    website_url: 'https://aws.amazon.com/activate',
    perks_summary: '$10,000 in AWS Promotional Credits valid for 2 years + 1-year AWS Business Support ($1,500 value).',
    eligibility: 'All active incubatees within first 24 months of incorporation.',
    expiry_date: '2027-12-31',
    redemption_instructions: 'Use Incubator Organization ID: VB-AIC-2026 in AWS Activate application portal.',
    approval_status: 'Approved',
    internal_notes: 'Annual renewal agreement signed with AWS India. Dedicated TAM allocated.',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z'
  },
  {
    id: 'vnd_02',
    company_name: 'Google for Startups Cloud Program',
    service_category: 'Cloud Computing',
    description: 'Full-suite cloud compute, BigQuery data warehousing, and Gemini multimodal AI model APIs.',
    contact_person: 'Divya Krishnan',
    contact_email: 'cloud-startups-in@google.com',
    contact_phone: '+91 80 6700 1000',
    website_url: 'https://cloud.google.com/startup',
    perks_summary: 'Up to $25,000 USD in Google Cloud credits + $500 monthly Gemini API credits for AI startups.',
    eligibility: 'Startups incorporated within 5 years with proprietary technology.',
    expiry_date: '2027-06-30',
    redemption_instructions: 'Apply using official startup email and select VentureBharat from Partner Accelerator list.',
    approval_status: 'Approved',
    internal_notes: 'Direct partner referral channel active.',
    created_at: '2026-01-15T12:00:00Z',
    updated_at: '2026-09-15T11:00:00Z'
  },
  {
    id: 'vnd_03',
    company_name: 'LexBharat Tech Legal Associates',
    service_category: 'Legal & IPR',
    description: 'Full-service technology law firm specializing in MCA filings, patent drafting, and seed funding term sheets.',
    contact_person: 'Adv. Suresh Mathur',
    contact_email: 'startups@lexbharat.in',
    contact_phone: '+91 11 2650 4400',
    website_url: 'https://lexbharat.in',
    perks_summary: '50% discount on Trademark & Patent filing fees + 2 free legal consultations on founder agreements.',
    eligibility: 'All enrolled cohort ventures.',
    expiry_date: '2026-12-31',
    redemption_instructions: 'Quote voucher code VB-LEGAL-2026 when scheduling initial onboarding consultation.',
    approval_status: 'Approved',
    internal_notes: 'Empanelled legal partner for incubator IPR facilitation cell.',
    created_at: '2026-02-01T11:00:00Z',
    updated_at: '2026-08-20T10:00:00Z'
  },
  {
    id: 'vnd_04',
    company_name: 'FinZen Chartered Accountants',
    service_category: 'Accounting & Audit',
    description: 'Expert audit and statutory compliance services tailored for venture-backed and grant-recipient Indian startups.',
    contact_person: 'CA Harish Bhalerao',
    contact_email: 'support@finzen.in',
    contact_phone: '+91 22 2840 9900',
    website_url: 'https://finzen.in',
    perks_summary: '3 months complimentary cloud bookkeeping + flat ₹7,500 rate for Audited Utilization Certificate (UC).',
    eligibility: 'All SISFS and NIDHI grant recipient startups.',
    expiry_date: '2027-03-31',
    redemption_instructions: 'Submit appointment request via email with company CIN and incubator admission letter.',
    approval_status: 'Approved',
    internal_notes: 'Audits match DST UC standard Annexure formats.',
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-10-05T09:00:00Z'
  },
  {
    id: 'vnd_05',
    company_name: 'Razorpay Rize Incubation Partner',
    service_category: 'Banking & FinTech',
    description: 'Unified payment gateway, corporate credit cards, and automated vendor payroll for Indian ventures.',
    contact_person: 'Kavita Nair (Ecosystem Lead)',
    contact_email: 'rize@razorpay.com',
    contact_phone: '+91 80 4666 9999',
    website_url: 'https://razorpay.com/rize',
    perks_summary: '₹10 Lakh free payment gateway credits + zero-maintenance fee startup current account with partner bank.',
    eligibility: 'All Indian registered startups in cohort.',
    expiry_date: '2027-12-31',
    redemption_instructions: 'Sign up on Razorpay Rize with incubator partner code: VENTUREBHARAT.',
    approval_status: 'Approved',
    internal_notes: 'Exclusive pre-approved business credit cards without collateral.',
    created_at: '2026-03-01T12:00:00Z',
    updated_at: '2026-09-01T14:00:00Z'
  }
];

// ================= COMMUNICATION: EMAIL TEMPLATES MOCK =================
const MOCK_EMAIL_TEMPLATES = [
  {
    id: 'tpl_01',
    template_name: 'Startup Application Received',
    category: 'Admissions',
    subject: 'Application Acknowledged: {{startup_name}} - VentureBharat Incubation Cohort',
    body_content: `<p>Dear {{founder_name}},</p>
<p>Thank you for submitting your innovation proposal for <strong>{{startup_name}}</strong> to the VentureBharat Incubation & Innovation Foundation.</p>
<p>Your application is currently being screened by our technical evaluation committee under the <strong>{{cohort_name}}</strong> intake framework. We will review your pitch summary, problem statement, and technical defensibility.</p>
<p>You can track the progress of your application on the VentureBharat Portal.</p>
<p>Best regards,<br/><strong>Incubation Admissions Directorate</strong><br/>VentureBharat Incubation Center (AIC - DST Recognized)</p>`,
    supported_variables: ['{{founder_name}}', '{{startup_name}}', '{{cohort_name}}'],
    is_system: true,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z'
  },
  {
    id: 'tpl_02',
    template_name: 'Application Accepted - Cohort Invitation',
    category: 'Admissions',
    subject: 'Congratulations! {{startup_name}} Accepted into VentureBharat Incubation',
    body_content: `<p>Dear {{founder_name}},</p>
<p>On behalf of the Governing Board of VentureBharat Incubation Centre, we are thrilled to inform you that <strong>{{startup_name}}</strong> has been accepted for incubation under <strong>{{cohort_name}}</strong>.</p>
<p>Your venture has been shortlisted for seed grant funding eligibility under Startup India & DST schemes, dedicated lab cleanroom access, and one-on-one mentorship.</p>
<p>Please log in to your portal to review and countersign the Incubation Memorandum of Understanding (MoU).</p>
<p>Warm regards,<br/><strong>Col. Vikramaditya Rathore</strong><br/>Chief Executive Officer, VentureBharat</p>`,
    supported_variables: ['{{founder_name}}', '{{startup_name}}', '{{cohort_name}}'],
    is_system: true,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z'
  },
  {
    id: 'tpl_03',
    template_name: 'Interview Invitation - Cohort Screening',
    category: 'Admissions',
    subject: 'Interview Scheduled: {{startup_name}} Evaluation Panel - VentureBharat',
    body_content: `<p>Dear {{founder_name}},</p>
<p>Following our initial technical review, the screening panel would like to invite you for a 20-minute pitch and evaluation interview for <strong>{{startup_name}}</strong>.</p>
<p>The session will cover technical feasibility, target market validation, and IP defensibility. Please keep a 10-slide pitch deck ready.</p>
<p>Meeting details and dial-in instructions will be shared via calendar invitation.</p>
<p>Sincerely,<br/><strong>Admissions & Evaluation Committee</strong><br/>VentureBharat</p>`,
    supported_variables: ['{{founder_name}}', '{{startup_name}}'],
    is_system: true,
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-09-10T11:00:00Z'
  },
  {
    id: 'tpl_04',
    template_name: 'Request for Additional Information',
    category: 'Admissions',
    subject: 'Action Required: Additional Clarification for {{startup_name}} Proposal',
    body_content: `<p>Dear {{founder_name}},</p>
<p>Our review panel is currently evaluating the application for <strong>{{startup_name}}</strong>. To complete the diligence process, we require clarification regarding your MCA incorporation and provisional patent status.</p>
<p>Please reply to this email or update your documentation on the portal within 3 working days.</p>
<p>Best regards,<br/><strong>Incubation Office</strong></p>`,
    supported_variables: ['{{founder_name}}', '{{startup_name}}'],
    is_system: true,
    created_at: '2026-01-08T10:00:00Z',
    updated_at: '2026-08-15T10:00:00Z'
  },
  {
    id: 'tpl_05',
    template_name: 'Support Ticket Acknowledgment',
    category: 'Support',
    subject: '[{{ticket_id}}] We have received your support request: {{subject}}',
    body_content: `<p>Dear {{founder_name}},</p>
<p>Your support ticket <strong>{{ticket_id}}</strong> regarding "<em>{{subject}}</em>" has been logged with the VentureBharat incubation support desk.</p>
<p>Our team is currently reviewing your inquiry. We typically respond within 24 business hours.</p>
<p>Track your ticket live on the VentureBharat Portal.</p>
<p>Best regards,<br/><strong>Incubation Support Desk</strong></p>`,
    supported_variables: ['{{founder_name}}', '{{ticket_id}}', '{{subject}}'],
    is_system: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-09-01T10:00:00Z'
  },
  {
    id: 'tpl_06',
    template_name: 'Support Ticket Status Update & Resolution',
    category: 'Support',
    subject: '[{{ticket_id}}] Status Update: {{ticket_status}}',
    body_content: `<p>Dear {{founder_name}},</p>
<p>This is an automated update regarding your support ticket <strong>{{ticket_id}}</strong> for <strong>{{startup_name}}</strong>.</p>
<p>The current status has been updated to: <strong>{{ticket_status}}</strong>.</p>
<p>Please log in to your startup portal to review staff notes and next steps.</p>
<p>Warm regards,<br/><strong>VentureBharat Helpdesk</strong></p>`,
    supported_variables: ['{{founder_name}}', '{{startup_name}}', '{{ticket_id}}', '{{ticket_status}}'],
    is_system: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-09-01T10:00:00Z'
  }
];

// ================= COMMUNICATION: EMAIL LOGS MOCK =================
const MOCK_EMAIL_LOGS = [
  {
    id: 'log_01',
    subject: 'Startup India Seed Fund Scheme (SISFS) Tranche 2 Submissions Open',
    recipient_count: 32,
    recipients: ['All Active Incubated Startups'],
    sent_by: 'Col. Vikramaditya Rathore',
    audience_filter: 'All Active Startups',
    delivery_status: 'Sent',
    provider_message_id: 'msg_resend_998124',
    sent_at: '2026-10-15T10:30:00Z'
  },
  {
    id: 'log_02',
    subject: 'Quarterly Mentor Office Hours Schedule - Autumn 2026',
    recipient_count: 45,
    recipients: ['Cohort 11 & 12 Founders'],
    sent_by: 'Programs Directorate',
    audience_filter: 'Selected Cohorts',
    delivery_status: 'Sent',
    provider_message_id: 'msg_resend_998011',
    sent_at: '2026-10-08T14:15:00Z'
  }
];

// ================= KNOWLEDGE: GUIDANCE DOCUMENTS MOCK =================
const MOCK_GUIDANCE_DOCUMENTS = [
  {
    id: 'gdoc_01',
    title: 'MCA21 Private Limited Company Incorporation Guide 2026',
    category: 'Company Incorporation',
    description: 'Step-by-step procedural handbook for SPICe+ Part A & B incorporation, Digital Signature Certificate (DSC), DIN, and RoC charter documents.',
    file_type: 'PDF',
    file_url: 'https://mca.gov.in/content/mca/global/en/home.html',
    source_link: 'https://www.mca.gov.in',
    is_official_government_resource: true,
    is_restricted: false,
    status: 'Published',
    last_updated_at: '2026-08-15T10:00:00Z'
  },
  {
    id: 'gdoc_02',
    title: 'DPIIT Startup Recognition & Tax Holiday (Section 80-IAC) Checklist',
    category: 'Startup India & DPIIT',
    description: 'Official criteria and documentation needed to secure DPIIT recognition, Angel Tax exemption (Section 56), and 3-year income tax holiday under Section 80-IAC.',
    file_type: 'PDF',
    file_url: 'https://www.startupindia.gov.in/content/sih/en/startupgov/startup-recognition-page.html',
    source_link: 'https://www.startupindia.gov.in',
    is_official_government_resource: true,
    is_restricted: false,
    status: 'Published',
    last_updated_at: '2026-09-01T12:00:00Z'
  },
  {
    id: 'gdoc_03',
    title: 'Patent Filing Handbook: Provisional vs Complete Specifications',
    category: 'Intellectual Property',
    description: 'Comprehensive guide published by the Indian Patent Office (CGPDTM) explaining Form 1, Form 2 drafting, novelty search, and fast-track examination for startups (SIPP scheme).',
    file_type: 'PDF',
    file_url: 'https://ipindia.gov.in',
    source_link: 'https://ipindia.gov.in',
    is_official_government_resource: true,
    is_restricted: false,
    status: 'Published',
    last_updated_at: '2026-07-20T14:30:00Z'
  },
  {
    id: 'gdoc_04',
    title: 'Standard Founder Equity Co-founder Agreement & Reverse Vesting Template',
    category: 'Founder Agreements',
    description: 'Model legal agreement covering founder vesting schedules (4-year vesting with 1-year cliff), intellectual property assignment to the company, and exit clauses.',
    file_type: 'DOCX',
    file_url: 'https://example.com/docs/founder_agreement_template.docx',
    source_link: 'https://lexbharat.in',
    is_official_government_resource: false,
    is_restricted: false,
    status: 'Published',
    last_updated_at: '2026-09-10T11:00:00Z'
  },
  {
    id: 'gdoc_05',
    title: 'Advance Tax, TDS & GST Statutory Compliance Calendar for Indian Startups',
    category: 'Accounting & Tax',
    description: 'Monthly and quarterly tax deadline calendar covering GSTR-1, GSTR-3B, TDS Form 26Q, Advance Tax tranches, and annual MCA AOC-4 / MGT-7 filings.',
    file_type: 'PDF',
    file_url: 'https://example.com/docs/startup_tax_calendar_2026.pdf',
    source_link: 'https://incometax.gov.in',
    is_official_government_resource: true,
    is_restricted: false,
    status: 'Published',
    last_updated_at: '2026-10-01T09:00:00Z'
  },
  {
    id: 'gdoc_06',
    title: 'Startup India Seed Fund Scheme (SISFS) Utilization Certificate Manual',
    category: 'Grants & Funding',
    description: 'Audit guidelines for compiling CA-certified GFR-12A utilization certificates, invoice verification, and eligible capital expenditure limits under SISFS guidelines.',
    file_type: 'PDF',
    file_url: 'https://seedfund.startupindia.gov.in',
    source_link: 'https://seedfund.startupindia.gov.in',
    is_official_government_resource: true,
    is_restricted: false,
    status: 'Published',
    last_updated_at: '2026-08-30T16:00:00Z'
  },
  {
    id: 'gdoc_07',
    title: 'AIC Cleanroom, Hardware Fabrication & Biometric Security Code of Conduct',
    category: 'Incubator Policies',
    description: 'Mandatory rules, cleanroom safety protocols, hazardous chemical handling, equipment booking quotas, and intellectual property confidentiality inside incubator labs.',
    file_type: 'Guide',
    file_url: '#',
    source_link: '',
    is_official_government_resource: false,
    is_restricted: true,
    status: 'Published',
    last_updated_at: '2026-10-05T10:00:00Z'
  }
];

// ================= HELPDESK: SUPPORT TICKETS & CALLBACKS MOCK =================
const MOCK_SUPPORT_TICKETS = [
  {
    id: 'tkt_01',
    ticket_number: 'VB-TKT-1042',
    startup_id: 'st_01',
    startup_name: 'KisanSetu DeepTech Labs',
    founder_name: 'Aarav Sharma',
    founder_email: 'founder@venturebharat.in',
    subject: 'Assistance with Tranche 2 Utilization Certificate CA audit sign-off',
    category: 'Funding/Grants',
    priority: 'High',
    description: 'We have compiled all invoices for the IoT edge sensor fabrication ($12,50,000 spend) and require the incubator directorate CA audit sign-off before upload to the national portal.',
    status: 'In Progress',
    assigned_to: 'CA Harish Bhalerao (Empanelled Auditor)',
    internal_notes: 'CA FinZen has received the documents. Schedule physical review on Thursday.',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-22T14:30:00Z',
    responses: [
      {
        id: 'resp_01',
        responder_name: 'Incubation Operations Desk',
        responder_role: 'admin',
        message: 'Your invoices have been verified by the internal finance team and passed to CA FinZen. Please ensure your physical asset ledger is updated for Bay 4B inspection.',
        created_at: '2026-10-21T11:00:00Z'
      }
    ]
  },
  {
    id: 'tkt_02',
    ticket_number: 'VB-TKT-1038',
    startup_id: 'st_01',
    startup_name: 'KisanSetu DeepTech Labs',
    founder_name: 'Aarav Sharma',
    founder_email: 'founder@venturebharat.in',
    subject: 'Biometric Cleanroom Bay 4B access card calibration',
    category: 'Incubator Facilities',
    priority: 'Normal',
    description: 'New research engineer Nikhil Verma needs biometric access granted for the 3D prototyping cleanroom.',
    status: 'Resolved',
    assigned_to: 'Lab Directorate',
    internal_notes: 'Biometrics registered on RFID access controller Bay 4B.',
    created_at: '2026-10-10T14:00:00Z',
    updated_at: '2026-10-12T09:30:00Z',
    responses: [
      {
        id: 'resp_02',
        responder_name: 'Lab Directorate',
        responder_role: 'admin',
        message: 'Access card issued and verified on biometric scanner. Access valid 24/7.',
        created_at: '2026-10-12T09:30:00Z'
      }
    ]
  },
  {
    id: 'tkt_03',
    ticket_number: 'VB-TKT-1049',
    startup_id: 'st_02',
    startup_name: 'AyurGen Biosystems',
    founder_name: 'Dr. Meera Nambiar',
    founder_email: 'meera@ayurgen.in',
    subject: 'Request for patent attorney referral for microfluidics chip IP',
    category: 'Legal/Compliance',
    priority: 'Normal',
    description: 'We have finalized our bio-sensor chip architecture and wish to file a provisional patent before presenting at the upcoming bio-innovators summit.',
    status: 'Open',
    assigned_to: 'IP Facilitation Cell',
    internal_notes: 'Refer to Adv. Pooja Sengupta at LexBharat.',
    created_at: '2026-10-24T16:00:00Z',
    updated_at: '2026-10-24T16:00:00Z',
    responses: []
  }
];

const MOCK_CALLBACK_REQUESTS = [
  {
    id: 'cb_01',
    reference_number: 'VB-CB-201',
    startup_id: 'st_01',
    startup_name: 'KisanSetu DeepTech Labs',
    founder_name: 'Aarav Sharma',
    phone: '+91 98765 43210',
    preferred_date: '2026-10-28',
    preferred_time_window: 'Morning (10 AM - 1 PM)',
    reason: 'Discuss angel syndicate demo day pitching format and valuation expectations.',
    additional_details: 'We want to align with Bharat Seed Ventures criteria before the investor panel.',
    status: 'Scheduled',
    admin_notes: 'Scheduled call with Col. Vikramaditya Rathore for Wednesday 11:30 AM.',
    created_at: '2026-10-22T10:00:00Z',
    updated_at: '2026-10-23T11:00:00Z'
  },
  {
    id: 'cb_02',
    reference_number: 'VB-CB-204',
    startup_id: 'st_03',
    startup_name: 'UrjaFlow Grid Solutions',
    founder_name: 'Er. Rajesh Varma',
    phone: '+91 98300 77112',
    preferred_date: '2026-10-29',
    preferred_time_window: 'Afternoon (2 PM - 5 PM)',
    reason: 'Guidance regarding state power distribution company (DISCOM) testing sandbox.',
    additional_details: 'UrjaFlow requires an official incubator recommendation letter.',
    status: 'Requested',
    admin_notes: 'Pending review by technical directorate.',
    created_at: '2026-10-24T15:30:00Z',
    updated_at: '2026-10-24T15:30:00Z'
  }
];

// Unified Supabase Service
export const supabaseService = {
  // Subscribe to Auth State Changes
  onAuthStateChange(callback) {
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
      return () => subscription.unsubscribe();
    }
    return () => {};
  },

  // Strict Sign In with email & password and post-authentication role authorization check
  async signIn({ email, password, role }) {
    if (!email || !email.trim() || !password) {
      throw new Error('Please enter both your registered official email and password.');
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Authentication is unavailable. Configure the Supabase project URL and publishable key, then reload.');
    }

    {
      console.log(`[Supabase Auth] Executing signInWithPassword for: "${cleanEmail}" on gateway: "${role}"`);

      // Step 1: Strict credential authentication via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        console.error('[Supabase Auth] Authentication error:', {
          status: error.status,
          message: error.message
        });

        const errMsg = (error.message || '').toLowerCase();

        // 1.1 Unconfirmed email check (must be checked BEFORE generic status 400 check!)
        if (errMsg.includes('email not confirmed') || errMsg.includes('not confirmed')) {
          throw new Error('Your email needs verification.');
        }

        // 1.2 Rate Limiting
        if (error.status === 429 || errMsg.includes('too many requests') || errMsg.includes('rate limit')) {
          throw new Error('Too many failed login attempts. Please wait a few minutes before trying again.');
        }

        // 1.3 Invalid credentials / user not found / bad grant
        if (
          errMsg.includes('invalid login credentials') ||
          errMsg.includes('invalid grant') ||
          errMsg.includes('invalid password') ||
          errMsg.includes('user not found') ||
          error.status === 400
        ) {
          throw new Error('Invalid email or password.');
        }

        // 1.4 Network / connection error
        if (errMsg.includes('failed to fetch') || errMsg.includes('network') || error.status === 0) {
          throw new Error('Unable to verify your access. Please try again.');
        }

        throw new Error(error.message || 'Invalid email or password.');
      }

      if (!data?.user) {
        throw new Error('Invalid email or password.');
      }

      if (!['admin', 'startup'].includes(role)) {
        await supabase.auth.signOut();
        throw new Error('Select a valid portal.');
      }

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, phone, designation, organization, is_active')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profileErr || !profile || profile.id !== data.user.id || profile.role !== role || profile.is_active === false) {
        await supabase.auth.signOut();
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('vb_active_user');
        }
        if (role === 'admin') throw new Error('This account is not authorized for the Admin Portal.');
        throw new Error('This account is not authorized for the Startup Innovator Portal.');
      }

      const activeUser = {
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
        full_name: profile.full_name || data.user.email.split('@')[0],
        phone: profile.phone || '',
        designation: profile.designation || '',
        organization: profile.organization || '',
        isSupabase: true
      };

      console.log(`[Supabase Auth] Login granted for ${cleanEmail} (Gateway: ${role}, Role: ${profile.role})`);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('vb_active_user', JSON.stringify(activeUser));
      }
      return { success: true, user: activeUser };
    }
  },

  // Strict Startup Innovator Registration (Always assigns 'startup' role)
  async signUpStartup(params = {}) {
    const email = params.email;
    const password = params.password;
    const full_name = (params.full_name || params.name || params.fullName || '').trim();
    const phone = (params.phone || '').trim();
    const startup_name = (params.startup_name || params.startupName || '').trim();
    const sector = (params.sector || 'DeepTech & AI').trim();
    const dpiit_number = (params.dpiit_number || params.dpiitNumber || '').trim();

    if (!email || !email.trim() || !email.includes('@')) {
      throw new Error('A valid official email address is required.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    if (!full_name) {
      throw new Error('Founder full name is required.');
    }
    if (!startup_name) {
      throw new Error('Startup / venture name is required.');
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Registration is unavailable. Configure the Supabase project URL and publishable key, then reload.');
    }

    {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: full_name.trim(),
            phone: phone?.trim(),
            role: 'startup', // Database trigger strictly enforces 'startup'
            startup_name: startup_name.trim(),
            sector: sector || 'DeepTech & AI',
            dpiit_number: dpiit_number?.trim() || null
          }
        }
      });

      if (error) {
        if (
          error.message?.toLowerCase().includes('already registered') ||
          error.message?.toLowerCase().includes('user already exists')
        ) {
          throw new Error('An account with this email address already exists. Please sign in instead.');
        }
        throw new Error(error.message || 'Registration failed. Please check inputs.');
      }

      // Check for duplicate account disguised by Supabase identity confirmation
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }

      const hasActiveSession = Boolean(data?.session);
      let profile = null;
      if (hasActiveSession && data?.user) {
        const { data: createdProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role, is_active, full_name, phone, organization')
          .eq('id', data.user.id)
          .maybeSingle();
        if (profileError || !createdProfile || createdProfile.id !== data.user.id || createdProfile.role !== 'startup' || createdProfile.is_active === false) {
          await supabase.auth.signOut();
          throw new Error('Your account was created, but its startup profile could not be verified. Contact support before signing in.');
        }
        profile = createdProfile;
      }

      const newUser = data?.user ? {
        id: data.user.id,
        email: cleanEmail,
        role: profile?.role || 'startup',
        full_name: profile?.full_name || full_name.trim(),
        phone: profile?.phone || phone?.trim(),
        startup_name: startup_name.trim(),
        sector: sector || 'DeepTech & AI',
        dpiit_number: dpiit_number?.trim() || null,
        organization: profile?.organization,
        isSupabase: true
      } : null;

      if (hasActiveSession && newUser) {
        localStorage.setItem('vb_active_user', JSON.stringify(newUser));
      }

      return {
        success: true,
        requiresEmailConfirmation: !hasActiveSession,
        user: newUser,
        message: hasActiveSession
          ? 'Registration successful! Welcome to the VentureBharat Incubation Portal.'
          : 'Registration successful! A verification email has been sent to your address. Please verify your email before logging in.'
      };
    }
  },

  // Test Role Escalation Prevention (Scenario 12)
  async attemptRoleEscalation(targetRole = 'admin') {
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session.');
      const { error } = await supabase
        .from('profiles')
        .update({ role: targetRole })
        .eq('id', session.user.id);
      if (error) throw error;
      return { success: true };
    }
    // In mock mode, database security trigger simulation denies modification
    throw new Error('Access Denied: You do not have permission to modify account roles.');
  },

  // Sign Out cleanly
  async signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem('vb_active_user');
  },

  // Securely create an authorized administrator (Restricted to existing Admins)
  async createAdminUser({ email, password, full_name, phone, designation }) {
    // 1. Verify current session is an authorized admin
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Access Denied: Only authorized administrators can create new admin accounts.');
    }

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Administrator creation requires the configured Supabase project.');
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Your session has expired. Please sign in again.');

    {
      const res = await fetch('/api/auth/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ email, password, full_name, phone, designation })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create administrator account.');
      }
      return data;
    }
  },

  // Get Current Session User with strict profile role re-verification
  async getCurrentUser() {
    if (!isSupabaseConfigured || !supabase) return null;
    {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          localStorage.removeItem('vb_active_user');
          return null;
        }

        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, phone, designation, organization, is_active')
          .eq('id', session.user.id)
          .maybeSingle();
        if (profileErr || !profile || profile.id !== session.user.id || !['admin', 'startup'].includes(profile.role) || profile.is_active === false) {
          await supabase.auth.signOut();
          localStorage.removeItem('vb_active_user');
          return null;
        }

        const activeUser = {
          id: session.user.id,
          email: session.user.email,
          role: profile.role,
          full_name: profile.full_name || session.user.email.split('@')[0],
          phone: profile.phone,
          designation: profile.designation,
          organization: profile.organization,
          isSupabase: true
        };

        localStorage.setItem('vb_active_user', JSON.stringify(activeUser));
        return activeUser;
      } catch (err) {
        console.warn('Session check failed:', err);
        localStorage.removeItem('vb_active_user');
        return null;
      }
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

    // Local preview data only; it does not authenticate users.
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

    // Local preview data only; it does not authenticate users.
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
  },

  // ================= 1. INVESTOR NETWORK CRUD =================
  async getInvestors() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('investors')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (err) {
        console.warn('Error reading investors from Supabase:', err.message);
      }
    }
    const cached = localStorage.getItem('vb_investors_cache');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return MOCK_INVESTORS;
  },

  async addInvestor(investorData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('investors')
        .insert([investorData])
        .select()
        .single();
      if (error) throw error;
      return { success: true, investor: data };
    }
    const current = await this.getInvestors();
    const newInv = {
      id: 'inv_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...investorData
    };
    const updated = [newInv, ...current];
    localStorage.setItem('vb_investors_cache', JSON.stringify(updated));
    return { success: true, investor: newInv };
  },

  async updateInvestor(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('investors')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, investor: data };
    }
    const current = await this.getInvestors();
    const updated = current.map((inv) =>
      inv.id === id ? { ...inv, ...updates, updated_at: new Date().toISOString() } : inv
    );
    localStorage.setItem('vb_investors_cache', JSON.stringify(updated));
    return { success: true, investor: updated.find((i) => i.id === id) };
  },

  async deleteInvestor(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('investors').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    const current = await this.getInvestors();
    const filtered = current.filter((inv) => inv.id !== id);
    localStorage.setItem('vb_investors_cache', JSON.stringify(filtered));
    return { success: true };
  },

  // ================= 2. MENTOR ROSTER CRUD =================
  async getMentors() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('mentors')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (err) {
        console.warn('Error reading mentors from Supabase:', err.message);
      }
    }
    const cached = localStorage.getItem('vb_mentors_cache');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return MOCK_MENTORS;
  },

  async addMentor(mentorData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('mentors')
        .insert([mentorData])
        .select()
        .single();
      if (error) throw error;
      return { success: true, mentor: data };
    }
    const current = await this.getMentors();
    const newMentor = {
      id: 'mnt_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...mentorData
    };
    const updated = [newMentor, ...current];
    localStorage.setItem('vb_mentors_cache', JSON.stringify(updated));
    return { success: true, mentor: newMentor };
  },

  async updateMentor(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('mentors')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, mentor: data };
    }
    const current = await this.getMentors();
    const updated = current.map((mnt) =>
      mnt.id === id ? { ...mnt, ...updates, updated_at: new Date().toISOString() } : mnt
    );
    localStorage.setItem('vb_mentors_cache', JSON.stringify(updated));
    return { success: true, mentor: updated.find((m) => m.id === id) };
  },

  async deleteMentor(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('mentors').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    const current = await this.getMentors();
    const filtered = current.filter((mnt) => mnt.id !== id);
    localStorage.setItem('vb_mentors_cache', JSON.stringify(filtered));
    return { success: true };
  },

  // ================= 3. APPROVED VENDORS CRUD =================
  async getVendors() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (err) {
        console.warn('Error reading vendors from Supabase:', err.message);
      }
    }
    const cached = localStorage.getItem('vb_vendors_cache');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return MOCK_VENDORS;
  },

  async addVendor(vendorData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('vendors')
        .insert([vendorData])
        .select()
        .single();
      if (error) throw error;
      return { success: true, vendor: data };
    }
    const current = await this.getVendors();
    const newVendor = {
      id: 'vnd_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...vendorData
    };
    const updated = [newVendor, ...current];
    localStorage.setItem('vb_vendors_cache', JSON.stringify(updated));
    return { success: true, vendor: newVendor };
  },

  async updateVendor(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('vendors')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, vendor: data };
    }
    const current = await this.getVendors();
    const updated = current.map((vnd) =>
      vnd.id === id ? { ...vnd, ...updates, updated_at: new Date().toISOString() } : vnd
    );
    localStorage.setItem('vb_vendors_cache', JSON.stringify(updated));
    return { success: true, vendor: updated.find((v) => v.id === id) };
  },

  async deleteVendor(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    const current = await this.getVendors();
    const filtered = current.filter((vnd) => vnd.id !== id);
    localStorage.setItem('vb_vendors_cache', JSON.stringify(filtered));
    return { success: true };
  },

  // ================= 4. EMAIL TEMPLATES & LOGS (COMMUNICATION HUB) =================
  async getEmailTemplates() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .order('template_name', { ascending: true });
        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (err) {
        console.warn('Error reading email_templates:', err.message);
      }
    }
    const cached = localStorage.getItem('vb_email_templates_cache');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return MOCK_EMAIL_TEMPLATES;
  },

  async saveEmailTemplate(templateData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('email_templates')
        .upsert([templateData])
        .select()
        .single();
      if (error) throw error;
      return { success: true, template: data };
    }
    const current = await this.getEmailTemplates();
    const exists = current.find((t) => t.id === templateData.id);
    let updated;
    if (exists) {
      updated = current.map((t) =>
        t.id === templateData.id ? { ...t, ...templateData, updated_at: new Date().toISOString() } : t
      );
    } else {
      const newTpl = {
        id: 'tpl_' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...templateData
      };
      updated = [newTpl, ...current];
    }
    localStorage.setItem('vb_email_templates_cache', JSON.stringify(updated));
    return { success: true };
  },

  async getEmailLogs() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('email_logs')
          .select('*')
          .order('sent_at', { ascending: false })
          .limit(50);
        if (!error && Array.isArray(data)) return data;
      } catch (err) {
        console.warn('Error reading email_logs:', err.message);
      }
    }
    const cached = localStorage.getItem('vb_email_logs_cache');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return MOCK_EMAIL_LOGS;
  },

  async logEmailSend(logData) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('email_logs').insert([logData]);
      } catch (e) {}
    }
    const current = await this.getEmailLogs();
    const newEntry = {
      id: 'log_' + Date.now(),
      sent_at: new Date().toISOString(),
      ...logData
    };
    const updated = [newEntry, ...current].slice(0, 50);
    localStorage.setItem('vb_email_logs_cache', JSON.stringify(updated));
    return newEntry;
  },

  // ================= 5. GUIDANCE CENTER DOCUMENTS =================
  async getGuidanceDocuments() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('guidance_documents')
          .select('*')
          .order('last_updated_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (err) {
        console.warn('Error reading guidance_documents:', err.message);
      }
    }
    const cached = localStorage.getItem('vb_guidance_cache');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return MOCK_GUIDANCE_DOCUMENTS;
  },

  async addGuidanceDocument(docData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('guidance_documents')
        .insert([docData])
        .select()
        .single();
      if (error) throw error;
      return { success: true, document: data };
    }
    const current = await this.getGuidanceDocuments();
    const newDoc = {
      id: 'gdoc_' + Date.now(),
      created_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
      ...docData
    };
    const updated = [newDoc, ...current];
    localStorage.setItem('vb_guidance_cache', JSON.stringify(updated));
    return { success: true, document: newDoc };
  },

  async updateGuidanceDocument(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('guidance_documents')
        .update({ ...updates, last_updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, document: data };
    }
    const current = await this.getGuidanceDocuments();
    const updated = current.map((d) =>
      d.id === id ? { ...d, ...updates, last_updated_at: new Date().toISOString() } : d
    );
    localStorage.setItem('vb_guidance_cache', JSON.stringify(updated));
    return { success: true, document: updated.find((d) => d.id === id) };
  },

  async deleteGuidanceDocument(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('guidance_documents').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    const current = await this.getGuidanceDocuments();
    const filtered = current.filter((d) => d.id !== id);
    localStorage.setItem('vb_guidance_cache', JSON.stringify(filtered));
    return { success: true };
  },

  // ================= 6. SUPPORT TICKETS & CALLBACKS =================
  async getSupportTickets(startupId = null) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
        if (startupId) query = query.eq('startup_id', startupId);
        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (err) {
        console.warn('Error reading support_tickets:', err.message);
      }
    }
    const cached = localStorage.getItem('vb_support_tickets_cache');
    let list = cached ? JSON.parse(cached) : MOCK_SUPPORT_TICKETS;
    if (startupId) list = list.filter((t) => t.startup_id === startupId || t.startup_name === startupId);
    return list;
  },

  async createSupportTicket(ticketData) {
    const ticketNumber = 'VB-TKT-' + (Math.floor(1000 + Math.random() * 9000));
    const fullTicket = {
      ticket_number: ticketNumber,
      status: 'Open',
      ...ticketData
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([fullTicket])
        .select()
        .single();
      if (error) throw error;
      return { success: true, ticket: data };
    }

    const current = await this.getSupportTickets();
    const newEntry = {
      id: 'tkt_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      responses: [],
      ...fullTicket
    };
    const updated = [newEntry, ...current];
    localStorage.setItem('vb_support_tickets_cache', JSON.stringify(updated));
    return { success: true, ticket: newEntry };
  },

  async updateTicketStatus(id, newStatus, staffNotes = '') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus, internal_notes: staffNotes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, ticket: data };
    }
    const current = await this.getSupportTickets();
    const updated = current.map((t) =>
      t.id === id ? { ...t, status: newStatus, internal_notes: staffNotes || t.internal_notes, updated_at: new Date().toISOString() } : t
    );
    localStorage.setItem('vb_support_tickets_cache', JSON.stringify(updated));
    return { success: true, ticket: updated.find((t) => t.id === id) };
  },

  async addTicketResponse(ticketId, responseData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('ticket_responses')
        .insert([{ ticket_id: ticketId, ...responseData }])
        .select()
        .single();
      if (error) throw error;
      return { success: true, response: data };
    }
    const current = await this.getSupportTickets();
    const newResp = {
      id: 'resp_' + Date.now(),
      created_at: new Date().toISOString(),
      ...responseData
    };
    const updated = current.map((t) => {
      if (t.id === ticketId) {
        return { ...t, responses: [...(t.responses || []), newResp] };
      }
      return t;
    });
    localStorage.setItem('vb_support_tickets_cache', JSON.stringify(updated));
    return { success: true, response: newResp };
  },

  async getCallbackRequests(startupId = null) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('callback_requests').select('*').order('created_at', { ascending: false });
        if (startupId) query = query.eq('startup_id', startupId);
        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (err) {
        console.warn('Error reading callback_requests:', err.message);
      }
    }
    const cached = localStorage.getItem('vb_callbacks_cache');
    let list = cached ? JSON.parse(cached) : MOCK_CALLBACK_REQUESTS;
    if (startupId) list = list.filter((c) => c.startup_id === startupId || c.startup_name === startupId);
    return list;
  },

  async createCallbackRequest(callbackData) {
    const refNum = 'VB-CB-' + (Math.floor(100 + Math.random() * 900));
    const fullCallback = {
      reference_number: refNum,
      status: 'Requested',
      ...callbackData
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('callback_requests')
        .insert([fullCallback])
        .select()
        .single();
      if (error) throw error;
      return { success: true, callback: data };
    }

    const current = await this.getCallbackRequests();
    const newEntry = {
      id: 'cb_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...fullCallback
    };
    const updated = [newEntry, ...current];
    localStorage.setItem('vb_callbacks_cache', JSON.stringify(updated));
    return { success: true, callback: newEntry };
  },

  async updateCallbackStatus(id, newStatus, adminNotes = '') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('callback_requests')
        .update({ status: newStatus, admin_notes: adminNotes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, callback: data };
    }
    const current = await this.getCallbackRequests();
    const updated = current.map((c) =>
      c.id === id ? { ...c, status: newStatus, admin_notes: adminNotes || c.admin_notes, updated_at: new Date().toISOString() } : c
    );
    localStorage.setItem('vb_callbacks_cache', JSON.stringify(updated));
    return { success: true, callback: updated.find((c) => c.id === id) };
  },

  // ================= 7. EXTENDED INTAKE & APPLICATION ACTIONS =================
  async updateApplicationDetails(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('cohort_applications')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return { id, ...updates };
  }
};
