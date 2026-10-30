-- ==============================================================================
-- 🇮🇳 VENTUREBHARAT INCUBATION PORTAL - MENTOR BOOKINGS & APPOINTMENTS SCHEMA
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- Safe and Idempotent
-- ==============================================================================

-- 1. Create mentor_bookings table
CREATE TABLE IF NOT EXISTS public.mentor_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_number TEXT NOT NULL UNIQUE,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
    mentor_name TEXT NOT NULL,
    mentor_organization TEXT,
    startup_id UUID REFERENCES public.startups(id) ON DELETE SET NULL,
    startup_name TEXT NOT NULL,
    founder_name TEXT NOT NULL,
    founder_email TEXT NOT NULL,
    topic TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time_window TEXT NOT NULL DEFAULT 'Morning (10 AM - 1 PM)',
    preferred_mode TEXT NOT NULL DEFAULT 'Virtual Video Conference',
    status TEXT NOT NULL DEFAULT 'Requested' CHECK (status IN ('Requested', 'Scheduled', 'Completed', 'Cancelled')),
    meeting_link TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.mentor_bookings ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Admins full access to mentor bookings" ON public.mentor_bookings;
CREATE POLICY "Admins full access to mentor bookings"
    ON public.mentor_bookings FOR ALL
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can create mentor bookings" ON public.mentor_bookings;
CREATE POLICY "Authenticated users can create mentor bookings"
    ON public.mentor_bookings FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users view mentor bookings" ON public.mentor_bookings;
CREATE POLICY "Authenticated users view mentor bookings"
    ON public.mentor_bookings FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR founder_email = auth.jwt() ->> 'email'
        OR EXISTS (
            SELECT 1 FROM public.startups
            WHERE startups.id = mentor_bookings.startup_id AND startups.profile_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins update mentor bookings" ON public.mentor_bookings;
CREATE POLICY "Admins update mentor bookings"
    ON public.mentor_bookings FOR UPDATE
    TO authenticated
    USING (public.is_admin());

-- 4. Grant Permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.mentor_bookings TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

