-- ==============================================================================
-- 🇮🇳 VENTUREBHARAT INCUBATION CENTER - SUPABASE DATABASE SCHEMA
-- Supported by Startup India, AIM (NITI Aayog) & DST, Government of India
-- ==============================================================================

-- 1. Enable Cryptographic & UUID Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ENUMS & DOMAINS
-- ==============================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('startup', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE startup_stage AS ENUM ('Applied', 'Screening', 'Incubated', 'Accelerated', 'Graduated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('Under Review', 'Interview Scheduled', 'Accepted', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE grant_status AS ENUM ('Requested', 'Under Inspection', 'Approved', 'Disbursed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. PROFILES TABLE (Linked directly to Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'startup',
    phone TEXT,
    avatar_url TEXT,
    designation TEXT,
    organization TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. STARTUPS DIRECTORY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.startups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    startup_name TEXT NOT NULL,
    legal_name TEXT,
    dpiit_number TEXT,
    sector TEXT NOT NULL DEFAULT 'DeepTech & AI',
    cohort TEXT NOT NULL DEFAULT 'Cohort 12 (Spring 2026)',
    stage startup_stage NOT NULL DEFAULT 'Incubated',
    founder_name TEXT NOT NULL,
    founder_email TEXT NOT NULL,
    founder_phone TEXT,
    pitch_deck_url TEXT,
    sanctioned_grant NUMERIC(12, 2) DEFAULT 2500000.00,
    disbursed_grant NUMERIC(12, 2) DEFAULT 1250000.00,
    grant_scheme TEXT DEFAULT 'Startup India Seed Fund Scheme (SISFS)',
    assigned_mentor TEXT DEFAULT 'Dr. Radhika Iyer (IIT Bombay Alum)',
    lab_access TEXT DEFAULT 'IoT Bay 4B & 3D Prototyping Cleanroom',
    milestone_progress INTEGER DEFAULT 40 CHECK (milestone_progress BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. COHORT APPLICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cohort_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_name TEXT NOT NULL,
    founder_name TEXT NOT NULL,
    founder_email TEXT NOT NULL,
    founder_phone TEXT NOT NULL,
    sector TEXT NOT NULL,
    cohort_name TEXT NOT NULL DEFAULT 'Cohort 13 (Autumn 2026)',
    dpiit_number TEXT,
    pitch_summary TEXT NOT NULL,
    status application_status NOT NULL DEFAULT 'Under Review',
    evaluation_score INTEGER CHECK (evaluation_score BETWEEN 0 AND 100),
    review_notes TEXT,
    reviewer_name TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. GRANT DISBURSEMENTS TABLE (SISFS & NIDHI-PRAYAS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.grant_disbursements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
    tranche_number INTEGER NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    grant_scheme TEXT NOT NULL DEFAULT 'SISFS',
    status grant_status NOT NULL DEFAULT 'Requested',
    milestone_title TEXT NOT NULL,
    milestone_description TEXT,
    utilization_certificate_url TEXT,
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. INCUBATION ANNOUNCEMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.incubation_announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Event', -- 'Grant', 'Mentorship', 'Lab', 'Event', 'Compliance'
    priority TEXT NOT NULL DEFAULT 'normal', -- 'normal', 'high', 'urgent'
    posted_by TEXT DEFAULT 'Incubation Operations Directorate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 8. FACILITY & LAB BOOKINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.facility_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
    facility_name TEXT NOT NULL, -- 'IoT Cleanroom Bay 4B', '3D Prototyping Lab', 'Conference Suite A'
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT DEFAULT 'Confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 9. HELPER FUNCTIONS & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Helper function to check if the requesting user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incubation_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_bookings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile or admins can read profiles"
    ON public.profiles FOR SELECT TO authenticated
    USING (id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "Users can update own profile details"
    ON public.profiles FOR UPDATE TO authenticated
    USING (id = (SELECT auth.uid()) OR public.is_admin())
    WITH CHECK (id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "Users can create own startup profile"
    ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (id = (SELECT auth.uid()) AND role = 'startup');

CREATE POLICY "Admins can manage profiles"
    ON public.profiles FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.protect_profile_authorization_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
        IF COALESCE((auth.jwt() ->> 'role') = 'service_role', false) IS NOT TRUE
           AND COALESCE(current_setting('role', true), '') NOT IN ('postgres', 'supabase_admin')
           AND public.is_admin() IS NOT TRUE THEN
            RAISE EXCEPTION 'Only an authorized administrator can change account authorization.';
        END IF;
    END IF;
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_enforce_profile_role_protection ON public.profiles;
CREATE TRIGGER trg_enforce_profile_role_protection
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_authorization_fields();

-- Startups Policies
CREATE POLICY "Startups can view their own record"
    ON public.startups FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can insert and modify any startup record"
    ON public.startups FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Startups can update their own startup details"
    ON public.startups FOR UPDATE
    TO authenticated
    USING (profile_id = auth.uid());

-- Cohort Applications Policies
CREATE POLICY "Anyone authenticated can insert a cohort application"
    ON public.cohort_applications FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admins can view and manage all applications"
    ON public.cohort_applications FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Applicants can view their own application by email"
    ON public.cohort_applications FOR SELECT
    TO authenticated
    USING (founder_email = auth.jwt() ->> 'email' OR public.is_admin());

-- Grant Disbursements Policies
CREATE POLICY "Startups can view their own grant disbursements"
    ON public.grant_disbursements FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.startups
            WHERE startups.id = grant_disbursements.startup_id AND startups.profile_id = auth.uid()
        ) OR public.is_admin()
    );

CREATE POLICY "Admins have full access to grant disbursements"
    ON public.grant_disbursements FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Announcements Policies
CREATE POLICY "Authenticated users can read announcements"
    ON public.incubation_announcements FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can manage announcements"
    ON public.incubation_announcements FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Facility Bookings Policies
CREATE POLICY "Startups can view and create their own bookings"
    ON public.facility_bookings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.startups
            WHERE startups.id = facility_bookings.startup_id AND startups.profile_id = auth.uid()
        ) OR public.is_admin()
    );

-- ==============================================================================
-- 10. AUTOMATED USER REGISTRATION TRIGGER
-- Automatically handles new Supabase Auth signups and creates profile & startup row
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.normalize_auth_email_change()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email_change := COALESCE(NEW.email_change, '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS normalize_auth_email_change ON auth.users;
CREATE TRIGGER normalize_auth_email_change
    BEFORE INSERT OR UPDATE OF email_change ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.normalize_auth_email_change();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role public.user_role;
    user_fullname TEXT;
    user_startup_name TEXT;
    user_sector TEXT;
    user_phone TEXT;
    user_dpiit_number TEXT;
BEGIN
    -- Never trust user-editable metadata to assign a privileged role.
    assigned_role := 'startup'::public.user_role;
    user_fullname := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    user_phone := new.raw_user_meta_data->>'phone';
    user_dpiit_number := NULLIF(new.raw_user_meta_data->>'dpiit_number', '');
    user_startup_name := COALESCE(new.raw_user_meta_data->>'startup_name', 'Innovative Labs Bharat');
    user_sector := COALESCE(new.raw_user_meta_data->>'sector', 'DeepTech & AI');

    -- Insert into profiles
    INSERT INTO public.profiles (id, email, full_name, role, phone, designation, organization)
    VALUES (
        new.id,
        new.email,
        user_fullname,
        assigned_role,
        user_phone,
        CASE WHEN assigned_role = 'admin' THEN 'Incubation Director' ELSE 'Founder & CEO' END,
        CASE WHEN assigned_role = 'admin' THEN 'VentureBharat Incubation Centre' ELSE user_startup_name END
    ) ON CONFLICT (id) DO NOTHING;

    -- If startup, create initial startup directory entry
    IF assigned_role = 'startup' THEN
        INSERT INTO public.startups (
            profile_id,
            startup_name,
            sector,
            cohort,
            stage,
            founder_name,
            founder_email,
            founder_phone,
            dpiit_number,
            sanctioned_grant,
            disbursed_grant,
            grant_scheme
        ) VALUES (
            new.id,
            user_startup_name,
            user_sector,
            'Cohort 12 (Spring 2026)',
            'Incubated',
            user_fullname,
            new.email,
            user_phone,
            user_dpiit_number,
            2500000.00,
            1250000.00,
            'Startup India Seed Fund Scheme (SISFS)'
        ) ON CONFLICT (profile_id) DO NOTHING;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 11. SAMPLE SEED DATA FOR DEMO & TESTING
-- ==============================================================================
INSERT INTO public.incubation_announcements (title, content, category, priority, posted_by)
VALUES 
(
    'Startup India Seed Fund Scheme (SISFS) Tranche 2 Submissions Open',
    'All Cohort 12 startups with 100% prototype completion can submit Utilization Certificates (UC) before the 30th of this month.',
    'Grant',
    'high',
    'Col. Vikramaditya Rathore (CEO)'
),
(
    'DeepTech & IoT Cleanroom Lab Upgraded with 5-Axis CNC & SMT Benches',
    'Hardware startups can book the upgraded cleanroom facility directly from their dashboard.',
    'Lab',
    'normal',
    'AIC Lab Directorate'
),
(
    'Investor Pitch Session with Bharat Angel Network',
    'Scheduled for upcoming Friday at 3:00 PM IST. 4 shortlisted startups will present to 12 angel investors.',
    'Event',
    'normal',
    'Programs & Partnerships'
);

INSERT INTO public.cohort_applications (startup_name, founder_name, founder_email, founder_phone, sector, cohort_name, dpiit_number, pitch_summary, status, evaluation_score, review_notes)
VALUES
(
    'AgroSense Robotics',
    'Pooja Nair',
    'pooja@agrosense.in',
    '+91 98223 44556',
    'AgriTech & Robotics',
    'Cohort 13 (Autumn 2026)',
    'DIPP-10492',
    'Autonomous precision spraying drones with AI weed detection for Indian smallholder farmers.',
    'Under Review',
    88,
    'High potential IP, prototype demonstrated in Maharashtra farms.'
),
(
    'NeuraMed Diagnostics',
    'Dr. Siddharth Rao',
    'siddharth@neuramed.in',
    '+91 97112 33445',
    'HealthTech & BioSensors',
    'Cohort 13 (Autumn 2026)',
    'DIPP-11203',
    'Point-of-care rapid blood diagnostics device using microfluidics and spectrophotometry.',
    'Interview Scheduled',
    92,
    'Passed technical due diligence. Panel interview set for Thursday.'
),
(
    'ChargeBharat EV',
    'Ankit Deshmukh',
    'ankit@chargebharat.com',
    '+91 99345 67890',
    'CleanTech & EV Infrastructure',
    'Cohort 13 (Autumn 2026)',
    'DIPP-09843',
    'Open-standard bidirectional EV charging stations designed for Indian grid voltage fluctuations.',
    'Accepted',
    95,
    'Approved by Board for ₹20 Lakh NIDHI-PRAYAS grant and bay allotment.'
);

