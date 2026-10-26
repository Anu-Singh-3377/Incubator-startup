-- ==============================================================================
-- 🇮🇳 VENTUREBHARAT INCUBATION CENTER - STAKEHOLDERS, COMMUNICATION & SUPPORT MIGRATION
-- Supports: Investor Network, Mentor Directory, Approved Vendors,
--           Email Templates & Logs (Resend), Guidance Center,
--           and Startup Support Tickets & Callback Requests.
-- Safe and Idempotent
-- ==============================================================================

-- 1. INVESTOR NETWORK TABLE
CREATE TABLE IF NOT EXISTS public.investors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fund_name TEXT NOT NULL,
    investor_type TEXT NOT NULL DEFAULT 'Venture Capital Fund' CHECK (investor_type IN ('Angel Investor', 'Venture Capital Fund', 'Syndicate', 'Family Office', 'Corporate Venture')),
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    focus_sectors TEXT NOT NULL DEFAULT 'DeepTech & AI, AgriTech, CleanTech',
    preferred_stage TEXT NOT NULL DEFAULT 'Seed' CHECK (preferred_stage IN ('Idea', 'Pre-seed', 'Seed', 'Growth')),
    investment_range TEXT NOT NULL DEFAULT '₹25 Lakh - ₹1 Crore',
    preferred_geography TEXT NOT NULL DEFAULT 'India / Pan-India',
    relationship_status TEXT NOT NULL DEFAULT 'Active Partner' CHECK (relationship_status IN ('Active Partner', 'Prospective', 'Network Member', 'Archived')),
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. MENTOR ROSTER TABLE
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    organization TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    areas_of_expertise TEXT NOT NULL DEFAULT 'Product Architecture, AI/ML, Hardware Engineering',
    industry_skills TEXT NOT NULL DEFAULT 'DeepTech, AgriTech, Embedded Systems',
    mentoring_topics TEXT NOT NULL DEFAULT 'Go-to-Market, Patent Strategy, Seed Fundraising',
    availability TEXT NOT NULL DEFAULT 'Bi-weekly Office Hours' CHECK (availability IN ('Weekly', 'Bi-weekly Office Hours', 'Monthly', 'On-Demand')),
    mentoring_format TEXT NOT NULL DEFAULT 'Hybrid (Virtual & In-Person)',
    linkedin_url TEXT,
    bio TEXT,
    internal_notes TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. APPROVED VENDORS & STARTUP PERKS CATALOG
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    service_category TEXT NOT NULL CHECK (service_category IN ('Cloud Computing', 'Legal & IPR', 'Accounting & Audit', 'Marketing & PR', 'HR & Talent', 'Product & Prototyping', 'Banking & FinTech', 'Incubation Facilities')),
    description TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    website_url TEXT,
    perks_summary TEXT NOT NULL,
    eligibility TEXT NOT NULL DEFAULT 'All enrolled cohort ventures',
    expiry_date DATE,
    redemption_instructions TEXT NOT NULL,
    approval_status TEXT NOT NULL DEFAULT 'Approved' CHECK (approval_status IN ('Approved', 'Pending Review', 'Archived')),
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. EMAIL TEMPLATES LIBRARY (Communication Hub)
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('Admissions', 'Onboarding', 'Mentorship', 'Investment', 'Announcements', 'Support')),
    subject TEXT NOT NULL,
    body_content TEXT NOT NULL,
    supported_variables TEXT[] DEFAULT ARRAY['{{founder_name}}', '{{startup_name}}', '{{cohort_name}}', '{{application_status}}', '{{ticket_id}}'],
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. EMAIL SEND LOGS (Resend Integration Records)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    recipient_count INTEGER NOT NULL DEFAULT 1,
    recipients TEXT[] NOT NULL,
    template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
    sent_by TEXT NOT NULL DEFAULT 'Incubation Operations Directorate',
    audience_filter TEXT NOT NULL DEFAULT 'Selected Startups',
    delivery_status TEXT NOT NULL DEFAULT 'Sent' CHECK (delivery_status IN ('Sent', 'Failed', 'Test Mode', 'Pending')),
    provider_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. GUIDANCE CENTER DOCUMENTS
CREATE TABLE IF NOT EXISTS public.guidance_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Company Incorporation', 'Startup India & DPIIT', 'Intellectual Property', 'Founder Agreements', 'Accounting & Tax', 'HR & Employment', 'Grants & Funding', 'Data Protection', 'Incubator Policies')),
    description TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'PDF' CHECK (file_type IN ('PDF', 'DOCX', 'External Link', 'Guide')),
    file_url TEXT,
    source_link TEXT,
    is_official_government_resource BOOLEAN DEFAULT false,
    is_restricted BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Published', 'Draft', 'Archived')),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SUPPORT TICKETS (Startup Helpdesk)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
    startup_name TEXT NOT NULL,
    founder_name TEXT NOT NULL,
    founder_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Technical', 'Legal/Compliance', 'Funding/Grants', 'Mentorship', 'Incubator Facilities', 'Documentation', 'Other')),
    priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High')),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Awaiting Startup Response', 'Resolved', 'Closed')),
    assigned_to TEXT DEFAULT 'Incubation Support Desk',
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. SUPPORT TICKET RESPONSES
CREATE TABLE IF NOT EXISTS public.ticket_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    responder_name TEXT NOT NULL,
    responder_role TEXT NOT NULL CHECK (responder_role IN ('admin', 'startup')),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. CALLBACK REQUESTS
CREATE TABLE IF NOT EXISTS public.callback_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_number TEXT NOT NULL UNIQUE,
    startup_id UUID REFERENCES public.startups(id) ON DELETE SET NULL,
    startup_name TEXT NOT NULL,
    founder_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_date DATE,
    preferred_time_window TEXT NOT NULL DEFAULT 'Morning (10 AM - 1 PM)',
    reason TEXT NOT NULL,
    additional_details TEXT,
    status TEXT NOT NULL DEFAULT 'Requested' CHECK (status IN ('Requested', 'Scheduled', 'Completed', 'Cancelled')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;

-- Investors RLS: Admins have full access; Startups can view non-archived investors (excluding internal notes via view/api)
DO $$ BEGIN
    CREATE POLICY "Admins full access to investors"
        ON public.investors FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups view active investors"
        ON public.investors FOR SELECT TO authenticated
        USING (relationship_status != 'Archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Mentors RLS: Admins have full access; Startups can view active mentors
DO $$ BEGIN
    CREATE POLICY "Admins full access to mentors"
        ON public.mentors FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups view active mentors"
        ON public.mentors FOR SELECT TO authenticated
        USING (status = 'Active');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Vendors RLS: Admins have full access; Startups can view approved vendors
DO $$ BEGIN
    CREATE POLICY "Admins full access to vendors"
        ON public.vendors FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups view approved vendors"
        ON public.vendors FOR SELECT TO authenticated
        USING (approval_status = 'Approved');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Guidance Documents RLS: Admins full access; Startups view published non-restricted documents
DO $$ BEGIN
    CREATE POLICY "Admins full access to guidance docs"
        ON public.guidance_documents FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups view published guidance docs"
        ON public.guidance_documents FOR SELECT TO authenticated
        USING (status = 'Published' AND (is_restricted = false OR public.is_admin()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Support Tickets RLS: Admins full access; Startups view & insert own tickets
DO $$ BEGIN
    CREATE POLICY "Admins full access to tickets"
        ON public.support_tickets FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups view own tickets"
        ON public.support_tickets FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.startups
                WHERE startups.id = support_tickets.startup_id AND startups.profile_id = auth.uid()
            ) OR public.is_admin()
        );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups insert own tickets"
        ON public.support_tickets FOR INSERT TO authenticated
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.startups
                WHERE startups.id = support_tickets.startup_id AND startups.profile_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Ticket Responses RLS
DO $$ BEGIN
    CREATE POLICY "Admins full access to ticket responses"
        ON public.ticket_responses FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups view non-internal responses for own ticket"
        ON public.ticket_responses FOR SELECT TO authenticated
        USING (
            is_internal = false AND EXISTS (
                SELECT 1 FROM public.support_tickets
                JOIN public.startups ON startups.id = support_tickets.startup_id
                WHERE support_tickets.id = ticket_responses.ticket_id AND startups.profile_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Callback Requests RLS
DO $$ BEGIN
    CREATE POLICY "Admins full access to callbacks"
        ON public.callback_requests FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups view own callbacks"
        ON public.callback_requests FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.startups
                WHERE startups.id = callback_requests.startup_id AND startups.profile_id = auth.uid()
            ) OR public.is_admin()
        );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups insert own callbacks"
        ON public.callback_requests FOR INSERT TO authenticated
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.startups
                WHERE startups.id = callback_requests.startup_id AND startups.profile_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Email Templates & Logs RLS: Admin-only
DO $$ BEGIN
    CREATE POLICY "Admins full access to email templates"
        ON public.email_templates FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins full access to email logs"
        ON public.email_logs FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

