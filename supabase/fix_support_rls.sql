-- ==============================================================================
-- 🇮🇳 VENTUREBHARAT INCUBATION PORTAL - SUPPORT & CALLBACK RLS FIX
-- Fixes HTTP 403 Forbidden on support_tickets and callback_requests
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Ensure startup_id on support_tickets and callback_requests is nullable
ALTER TABLE public.support_tickets ALTER COLUMN startup_id DROP NOT NULL;
ALTER TABLE public.callback_requests ALTER COLUMN startup_id DROP NOT NULL;

-- 2. Create ticket_responses table if not already created
CREATE TABLE IF NOT EXISTS public.ticket_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    responder_name TEXT NOT NULL,
    responder_role TEXT NOT NULL DEFAULT 'startup',
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure backwards-compatible columns (author_name & author_role) if table already existed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ticket_responses' AND column_name='author_name') THEN
    ALTER TABLE public.ticket_responses ADD COLUMN author_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ticket_responses' AND column_name='author_role') THEN
    ALTER TABLE public.ticket_responses ADD COLUMN author_role TEXT;
  END IF;
END $$;

-- 3. Enable RLS on all 3 support tables
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any conflicting old policies
DROP POLICY IF EXISTS "Admins full access to tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins full access tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Startups view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Startups insert own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins have full access to support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Authenticated users can create support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Startups can view own support tickets" ON public.support_tickets;

DROP POLICY IF EXISTS "Admins full access to callbacks" ON public.callback_requests;
DROP POLICY IF EXISTS "Admins full access callbacks" ON public.callback_requests;
DROP POLICY IF EXISTS "Startups view own callbacks" ON public.callback_requests;
DROP POLICY IF EXISTS "Startups insert own callbacks" ON public.callback_requests;
DROP POLICY IF EXISTS "Admins have full access to callback requests" ON public.callback_requests;
DROP POLICY IF EXISTS "Authenticated users can create callback requests" ON public.callback_requests;
DROP POLICY IF EXISTS "Authenticated users can view own callback requests" ON public.callback_requests;
DROP POLICY IF EXISTS "Authenticated users can view callback requests" ON public.callback_requests;

DROP POLICY IF EXISTS "Admins full access to ticket responses" ON public.ticket_responses;
DROP POLICY IF EXISTS "Authenticated users insert ticket responses" ON public.ticket_responses;
DROP POLICY IF EXISTS "Authenticated users view ticket responses" ON public.ticket_responses;
DROP POLICY IF EXISTS "Admins have full access to ticket responses" ON public.ticket_responses;
DROP POLICY IF EXISTS "Authenticated users can insert ticket responses" ON public.ticket_responses;
DROP POLICY IF EXISTS "Authenticated users can view non-internal ticket responses" ON public.ticket_responses;

-- 5. POLICIES FOR SUPPORT TICKETS
-- Admins have unrestricted access
CREATE POLICY "Admins have full access to support tickets"
    ON public.support_tickets FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Logged-in founders/startups can submit support tickets
CREATE POLICY "Authenticated users can create support tickets"
    ON public.support_tickets FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

-- Logged-in founders can view their own tickets
CREATE POLICY "Startups can view own support tickets"
    ON public.support_tickets FOR SELECT
    TO authenticated
    USING (
        founder_email = auth.jwt() ->> 'email'
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.startups
            WHERE startups.id = support_tickets.startup_id AND startups.profile_id = auth.uid()
        )
    );

-- 6. POLICIES FOR CALLBACK REQUESTS
-- Admins have unrestricted access
CREATE POLICY "Admins have full access to callback requests"
    ON public.callback_requests FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Logged-in founders/startups can request callbacks
CREATE POLICY "Authenticated users can create callback requests"
    ON public.callback_requests FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

-- Logged-in founders can view their callbacks
CREATE POLICY "Authenticated users can view callback requests"
    ON public.callback_requests FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.startups
            WHERE startups.id = callback_requests.startup_id AND startups.profile_id = auth.uid()
        )
    );

-- 7. POLICIES FOR TICKET CONVERSATION RESPONSES
CREATE POLICY "Admins have full access to ticket responses"
    ON public.ticket_responses FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Authenticated users can insert ticket responses"
    ON public.ticket_responses FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view non-internal ticket responses"
    ON public.ticket_responses FOR SELECT
    TO authenticated
    USING (is_internal = false OR public.is_admin());

-- 8. GRANT ACCESS TO ROLES
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

