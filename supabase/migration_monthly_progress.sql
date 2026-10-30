-- ==============================================================================
-- 🇮🇳 VENTUREBHARAT INCUBATION PORTAL - MONTHLY PROGRESS REPORTS
-- Admin-recorded monthly work log for each incubated startup.
-- Additive only: creates one new table, does not alter existing tables.
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.monthly_progress_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    startup_name TEXT,
    report_month DATE NOT NULL,                -- always the 1st of the month, e.g. 2026-10-01
    work_summary TEXT NOT NULL,
    milestones_achieved TEXT,
    challenges TEXT,
    next_month_goals TEXT,
    progress_score INTEGER CHECK (progress_score BETWEEN 0 AND 100),
    status TEXT NOT NULL DEFAULT 'On Track' CHECK (status IN ('On Track', 'Needs Attention', 'At Risk')),
    revenue_inr NUMERIC,
    team_size INTEGER,
    recorded_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (startup_id, report_month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_progress_month ON public.monthly_progress_reports (report_month);

ALTER TABLE public.monthly_progress_reports ENABLE ROW LEVEL SECURITY;

-- Admins record, edit and delete reports
DO $$ BEGIN
    CREATE POLICY "Admins full access to monthly progress"
        ON public.monthly_progress_reports FOR ALL TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Founders can read the reports written about their own startup
DO $$ BEGIN
    CREATE POLICY "Startups view own monthly progress"
        ON public.monthly_progress_reports FOR SELECT TO authenticated
        USING (
            public.is_admin()
            OR EXISTS (
                SELECT 1 FROM public.startups
                WHERE startups.id = monthly_progress_reports.startup_id AND startups.profile_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null; END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_progress_reports TO authenticated;
