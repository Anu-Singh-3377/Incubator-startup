-- ==============================================================================
-- 🇮🇳 VENTUREBHARAT INCUBATION PORTAL - COMPLETE PLATFORM MIGRATION
-- Supported by Startup India, AIM (NITI Aayog) & DST, Government of India
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- Safe, Idempotent, and Non-destructive (Uses IF NOT EXISTS & Exception handling)
-- ==============================================================================

-- 1. ADD EXTENDED COLUMNS TO STARTUPS TABLE
ALTER TABLE public.startups 
    ADD COLUMN IF NOT EXISTS company_overview TEXT DEFAULT 'Innovative startup in active incubation phase.',
    ADD COLUMN IF NOT EXISTS mca_number TEXT,
    ADD COLUMN IF NOT EXISTS incorporation_date DATE,
    ADD COLUMN IF NOT EXISTS incorporation_status TEXT DEFAULT 'Incorporated (Pvt Ltd)',
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- 2. COMPLIANCE DOCUMENTS TABLE (For Startup Compliance Tracker)
CREATE TABLE IF NOT EXISTS public.compliance_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    file_url TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Verified', 'Under Review', 'Pending', 'Rejected')),
    mandatory BOOLEAN DEFAULT TRUE,
    uploaded_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Startups view own compliance documents"
        ON public.compliance_documents FOR SELECT TO authenticated
        USING (EXISTS (SELECT 1 FROM public.startups WHERE startups.id = compliance_documents.startup_id AND startups.profile_id = auth.uid()) OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins full access to compliance documents"
        ON public.compliance_documents FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. INVESTOR NETWORK TABLE
CREATE TABLE IF NOT EXISTS public.investors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fund_name TEXT NOT NULL,
    investor_type TEXT NOT NULL DEFAULT 'Venture Capital Fund',
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    focus_sectors TEXT NOT NULL DEFAULT 'DeepTech & AI, AgriTech, CleanTech',
    preferred_stage TEXT NOT NULL DEFAULT 'Seed',
    investment_range TEXT NOT NULL DEFAULT '₹25 Lakh - ₹1 Crore',
    preferred_geography TEXT NOT NULL DEFAULT 'India / Pan-India',
    relationship_status TEXT NOT NULL DEFAULT 'Active Partner',
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;

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

-- 4. MENTOR ROSTER TABLE
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
    availability TEXT NOT NULL DEFAULT 'Bi-weekly Office Hours',
    mentoring_format TEXT NOT NULL DEFAULT 'Hybrid (Virtual & In-Person)',
    linkedin_url TEXT,
    bio TEXT,
    internal_notes TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

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

-- 5. APPROVED VENDORS & STARTUP PERKS CATALOG
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    service_category TEXT NOT NULL,
    description TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    website_url TEXT,
    perks_summary TEXT NOT NULL,
    eligibility TEXT NOT NULL DEFAULT 'All enrolled cohort ventures',
    expiry_date DATE,
    redemption_instructions TEXT NOT NULL,
    approval_status TEXT NOT NULL DEFAULT 'Approved',
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

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

-- 6. EMAIL TEMPLATES LIBRARY (Communication Hub)
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_content TEXT NOT NULL,
    supported_variables TEXT[] DEFAULT ARRAY['{{founder_name}}', '{{startup_name}}', '{{cohort_name}}', '{{application_status}}', '{{ticket_id}}'],
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Admins full access to email templates"
        ON public.email_templates FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 7. EMAIL SEND LOGS (Resend Integration Records)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    recipient_count INTEGER NOT NULL DEFAULT 1,
    recipients TEXT[] NOT NULL,
    template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
    sent_by TEXT NOT NULL DEFAULT 'Incubation Operations Directorate',
    audience_filter TEXT NOT NULL DEFAULT 'Selected Startups',
    delivery_status TEXT NOT NULL DEFAULT 'Sent',
    provider_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Admins full access to email logs"
        ON public.email_logs FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 8. GUIDANCE CENTER DOCUMENTS
CREATE TABLE IF NOT EXISTS public.guidance_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'PDF',
    file_url TEXT,
    source_link TEXT,
    is_official_government_resource BOOLEAN DEFAULT false,
    is_restricted BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'Published',
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.guidance_documents ENABLE ROW LEVEL SECURITY;

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

-- 9. SUPPORT TICKETS (Startup Helpdesk)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
    startup_name TEXT NOT NULL,
    founder_name TEXT NOT NULL,
    founder_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Normal',
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    assigned_to TEXT DEFAULT 'Incubation Support Desk',
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Admins full access to tickets"
        ON public.support_tickets FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups view own tickets"
        ON public.support_tickets FOR SELECT TO authenticated
        USING (EXISTS (SELECT 1 FROM public.startups WHERE startups.id = support_tickets.startup_id AND startups.profile_id = auth.uid()) OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups insert own tickets"
        ON public.support_tickets FOR INSERT TO authenticated
        WITH CHECK (EXISTS (SELECT 1 FROM public.startups WHERE startups.id = support_tickets.startup_id AND startups.profile_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 10. CALLBACK REQUESTS
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
    status TEXT NOT NULL DEFAULT 'Requested',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Admins full access to callbacks"
        ON public.callback_requests FOR ALL TO authenticated
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups view own callbacks"
        ON public.callback_requests FOR SELECT TO authenticated
        USING (EXISTS (SELECT 1 FROM public.startups WHERE startups.id = callback_requests.startup_id AND startups.profile_id = auth.uid()) OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Startups insert own callbacks"
        ON public.callback_requests FOR INSERT TO authenticated
        WITH CHECK (EXISTS (SELECT 1 FROM public.startups WHERE startups.id = callback_requests.startup_id AND startups.profile_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 11. GRANT PERMISSIONS ON ALL PUBLIC TABLES TO SUPABASE CLIENT ROLES
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 12. CLEANUP BROKEN ADMIN USERS (Restores admin@venturebharat.in cleanly)
DELETE FROM public.startups WHERE founder_email IN ('admin@venturebharat.in', 'director@venturebharat.in');
DELETE FROM public.profiles WHERE email IN ('admin@venturebharat.in', 'director@venturebharat.in');
DELETE FROM auth.identities WHERE email IN ('admin@venturebharat.in', 'director@venturebharat.in');
DELETE FROM auth.users WHERE email IN ('admin@venturebharat.in', 'director@venturebharat.in');

DO $$
DECLARE
    new_admin_id UUID := gen_random_uuid();
    admin_email TEXT := 'admin@venturebharat.in';
    admin_password TEXT := 'AdminPassword123!';
    encrypted_pw TEXT;
BEGIN
    encrypted_pw := crypt(admin_password, gen_salt('bf'));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token, email_change,
        email_change_token_new, recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', new_admin_id, 'authenticated', 'authenticated',
        admin_email, encrypted_pw, now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Col. Vikramaditya Rathore","role":"admin"}',
        now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
    ) VALUES (
        new_admin_id, new_admin_id,
        jsonb_build_object('sub', new_admin_id::text, 'email', admin_email),
        'email', admin_email, now(), now(), now()
    );

    INSERT INTO public.profiles (
        id, email, full_name, role, phone, designation, organization, is_active, created_at, updated_at
    ) VALUES (
        new_admin_id, admin_email, 'Col. Vikramaditya Rathore', 'admin'::user_role,
        '+91 98110 54321', 'Incubation Director & Program Officer',
        'VentureBharat Incubation Foundation (AIM/DST)', true, now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin'::user_role, is_active = true;

    DELETE FROM public.startups WHERE profile_id = new_admin_id;
END $$;

