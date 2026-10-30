-- ==============================================================================
-- 🇮🇳 VENTUREBHARAT INCUBATION PORTAL - MILESTONE TASKS & PROGRESS VERIFICATION
-- Founders submit completed incubation activities; admins verify or request changes.
-- Additive only: creates new tables, triggers, policies and a private storage bucket.
-- Does NOT alter startups, profiles or any existing table or policy.
-- Requires public.is_admin() from migration_secure_auth_roles.sql.
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run (safe to re-run).
-- ==============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROGRAMME DEFINITION: lifecycle stages and the planned activities in each
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.milestone_stages (
    id TEXT PRIMARY KEY,                          -- stable key, e.g. 'prototyping'
    stage_order SMALLINT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.milestone_tasks (
    id TEXT PRIMARY KEY,                          -- stable key, e.g. 'prototyping.bench_test'
    stage_id TEXT NOT NULL REFERENCES public.milestone_stages(id) ON DELETE CASCADE,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    description TEXT,
    evidence_hint TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_milestone_tasks_stage ON public.milestone_tasks (stage_id, sort_order);

-- Seed the five existing lifecycle stages (same titles and descriptions as the dashboard).
-- ON CONFLICT DO NOTHING keeps any edits an admin has made since.
INSERT INTO public.milestone_stages (id, stage_order, title, description) VALUES
    ('onboarding',  1, 'Screening & Onboarding', 'DPIIT registration & AIC MoU signed'),
    ('prototyping', 2, 'Lab Prototyping',        'Hardware fabrication in Cleanroom Bay 4B'),
    ('pilot',       3, 'Field Pilot Testing',    'Agricultural sensor deployment'),
    ('tranche2',    4, 'Tranche 2 Disbursal',    'Milestone UC verification'),
    ('demoday',     5, 'Cohort Demo Day',        'Pitching to angel networks')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.milestone_tasks (id, stage_id, sort_order, title, description, evidence_hint) VALUES
    ('onboarding.dpiit',          'onboarding', 1, 'DPIIT recognition certificate',      'Obtain and share the DPIIT startup recognition certificate.', 'DPIIT certificate (PDF)'),
    ('onboarding.mou',            'onboarding', 2, 'Incubation MoU signed',              'Sign the AIC incubation agreement and MoU.',                  'Signed MoU (PDF)'),
    ('onboarding.pfms',           'onboarding', 3, 'Bank & PFMS registration',           'Register the startup bank account on PFMS for grant transfers.', 'PFMS registration screenshot'),
    ('onboarding.orientation',    'onboarding', 4, 'Cohort orientation attended',        'Attend the cohort onboarding and orientation session.',       NULL),
    ('prototyping.design',        'prototyping', 1, 'Prototype design finalised',        'Freeze the design, CAD files and bill of materials.',         'BOM or design document'),
    ('prototyping.safety',        'prototyping', 2, 'Lab safety induction completed',    'Complete the cleanroom and lab safety induction.',            'Induction certificate'),
    ('prototyping.build',         'prototyping', 3, 'Working prototype built',           'Assemble a working prototype in the allotted lab.',           'Photo of the prototype'),
    ('prototyping.bench_test',    'prototyping', 4, 'Bench test report',                 'Run bench tests and document the results.',                   'Test report (PDF)'),
    ('pilot.site_agreement',      'pilot', 1, 'Pilot site agreement',                    'Sign an agreement with the pilot site or partner.',           'Signed agreement'),
    ('pilot.deployment',          'pilot', 2, 'Pilot units deployed',                    'Deploy the pilot units in the field.',                        'Deployment photos'),
    ('pilot.feedback',            'pilot', 3, 'Pilot data & feedback report',            'Collect field data and user feedback from the pilot.',        'Pilot report (PDF)'),
    ('pilot.ip_filing',           'pilot', 4, 'IP / patent filing initiated',            'File or initiate the provisional patent or IP application.',  'Filing receipt'),
    ('tranche2.uc',               'tranche2', 1, 'Tranche 1 Utilisation Certificate',    'Submit the Utilisation Certificate for Tranche 1.',           'Signed UC (PDF)'),
    ('tranche2.expenses',         'tranche2', 2, 'Audited expense statement',            'Share the CA-audited statement of Tranche 1 expenses.',       'Audited statement (PDF)'),
    ('tranche2.review',           'tranche2', 3, 'Milestone review presentation',        'Present milestone progress to the review committee.',         'Presentation deck'),
    ('tranche2.request',          'tranche2', 4, 'Tranche 2 request filed',              'File the formal Tranche 2 disbursal request.',                NULL),
    ('demoday.deck',              'demoday', 1, 'Pitch deck finalised',                  'Finalise the investor pitch deck.',                           'Pitch deck (PDF)'),
    ('demoday.mock_pitch',        'demoday', 2, 'Mock pitch with mentor',                'Rehearse the pitch with your assigned mentor.',               NULL),
    ('demoday.financials',        'demoday', 3, 'Financial model prepared',              'Prepare a 3-year financial model and fundraising ask.',       'Financial model'),
    ('demoday.pitch',             'demoday', 4, 'Demo Day pitch delivered',              'Pitch to the angel network at Cohort Demo Day.',              NULL)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. FOUNDER SUBMISSIONS: one row per startup per activity (resubmissions update it)
--    "Not Started" is the absence of a row, so no placeholder rows are stored.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL REFERENCES public.milestone_tasks(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'In Progress'
        CHECK (status IN ('In Progress', 'Submitted for Review', 'Verified by Admin', 'Changes Requested')),
    completion_description TEXT,
    completion_date DATE,
    evidence_path TEXT,                            -- object path inside the progress-evidence bucket
    evidence_name TEXT,
    founder_remarks TEXT,
    reporting_month DATE,                          -- first day of the month of the latest submission
    submitted_at TIMESTAMP WITH TIME ZONE,
    submission_count INTEGER NOT NULL DEFAULT 0,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (startup_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_submissions_startup ON public.task_submissions (startup_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON public.task_submissions (status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_month ON public.task_submissions (reporting_month);

-- Audit trail of every submission and review. Written only by the trigger below.
CREATE TABLE IF NOT EXISTS public.task_submission_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES public.task_submissions(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    action TEXT NOT NULL,                          -- draft_saved | submitted | resubmitted | verified | changes_requested
    status TEXT NOT NULL,
    remarks TEXT,
    actor_id UUID,
    actor_role TEXT NOT NULL,                      -- founder | admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_events_submission ON public.task_submission_events (submission_id, created_at);
CREATE INDEX IF NOT EXISTS idx_task_events_startup ON public.task_submission_events (startup_id);

-- ---------------------------------------------------------------------------
-- 3. GUARD TRIGGER: enforces the workflow on the server, whatever the client sends
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.task_submissions_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    v_admin BOOLEAN := public.is_admin();
    v_becomes_submitted BOOLEAN;
BEGIN
    NEW.updated_at := now();

    IF TG_OP = 'INSERT' THEN
        NEW.created_at := now();
        NEW.submission_count := 0;
        NEW.submitted_at := NULL;
        NEW.reporting_month := NULL;
        IF NOT v_admin THEN
            NEW.submitted_by := auth.uid();
            NEW.reviewed_by := NULL;
            NEW.reviewed_at := NULL;
            NEW.admin_remarks := NULL;
            IF NEW.status NOT IN ('In Progress', 'Submitted for Review') THEN
                RAISE EXCEPTION 'Founders can only save a draft or submit an activity for review.';
            END IF;
        END IF;
        v_becomes_submitted := NEW.status = 'Submitted for Review';
    ELSE
        -- Identity and bookkeeping columns never change on update
        NEW.id := OLD.id;
        NEW.startup_id := OLD.startup_id;
        NEW.task_id := OLD.task_id;
        NEW.created_at := OLD.created_at;
        NEW.submitted_at := OLD.submitted_at;
        NEW.submission_count := OLD.submission_count;
        NEW.reporting_month := OLD.reporting_month;

        IF NOT v_admin THEN
            IF OLD.status = 'Verified by Admin' THEN
                RAISE EXCEPTION 'This activity has been verified and can no longer be edited.';
            END IF;
            IF NEW.status NOT IN ('In Progress', 'Submitted for Review') THEN
                RAISE EXCEPTION 'Founders can only save a draft or submit an activity for review.';
            END IF;
            -- Review fields belong to the admin
            NEW.reviewed_by := OLD.reviewed_by;
            NEW.reviewed_at := OLD.reviewed_at;
            NEW.admin_remarks := OLD.admin_remarks;
            NEW.submitted_by := auth.uid();
        ELSE
            -- Admins review; they do not rewrite the founder's submission
            NEW.submitted_by := OLD.submitted_by;
            NEW.completion_description := OLD.completion_description;
            NEW.completion_date := OLD.completion_date;
            NEW.evidence_path := OLD.evidence_path;
            NEW.evidence_name := OLD.evidence_name;
            NEW.founder_remarks := OLD.founder_remarks;
            IF NEW.status IN ('Verified by Admin', 'Changes Requested') AND NEW.status IS DISTINCT FROM OLD.status THEN
                IF OLD.status NOT IN ('Submitted for Review', 'Verified by Admin', 'Changes Requested') THEN
                    RAISE EXCEPTION 'Only submitted activities can be reviewed.';
                END IF;
                NEW.reviewed_at := now();
                NEW.reviewed_by := auth.uid();
            ELSE
                NEW.reviewed_at := OLD.reviewed_at;
                NEW.reviewed_by := OLD.reviewed_by;
            END IF;
            IF NEW.status = 'Changes Requested' AND COALESCE(btrim(NEW.admin_remarks), '') = '' THEN
                RAISE EXCEPTION 'Please give a reason when requesting changes.';
            END IF;
        END IF;
        v_becomes_submitted := NEW.status = 'Submitted for Review' AND OLD.status IS DISTINCT FROM 'Submitted for Review';
    END IF;

    -- Founder-supplied content checks
    IF NEW.completion_date IS NOT NULL AND NEW.completion_date > current_date + 1 THEN
        RAISE EXCEPTION 'The completion date cannot be in the future.';
    END IF;

    IF v_becomes_submitted THEN
        IF COALESCE(btrim(NEW.completion_description), '') = '' THEN
            RAISE EXCEPTION 'A completion description is required before submitting.';
        END IF;
        IF NEW.completion_date IS NULL THEN
            RAISE EXCEPTION 'A completion date is required before submitting.';
        END IF;
        NEW.submitted_at := now();
        NEW.submission_count := NEW.submission_count + 1;
        NEW.reporting_month := date_trunc('month', now())::date;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_task_submissions_guard ON public.task_submissions;
CREATE TRIGGER trg_task_submissions_guard
    BEFORE INSERT OR UPDATE ON public.task_submissions
    FOR EACH ROW EXECUTE FUNCTION public.task_submissions_guard();

-- Audit trail writer (SECURITY DEFINER so clients never insert history directly)
CREATE OR REPLACE FUNCTION public.task_submissions_log_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_action TEXT;
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status
       AND NEW.submission_count = OLD.submission_count THEN
        RETURN NEW;  -- content edit without a workflow change
    END IF;

    v_action := CASE NEW.status
        WHEN 'In Progress' THEN 'draft_saved'
        WHEN 'Submitted for Review' THEN CASE WHEN NEW.submission_count > 1 THEN 'resubmitted' ELSE 'submitted' END
        WHEN 'Verified by Admin' THEN 'verified'
        WHEN 'Changes Requested' THEN 'changes_requested'
    END;

    INSERT INTO public.task_submission_events (submission_id, startup_id, action, status, remarks, actor_id, actor_role)
    VALUES (
        NEW.id,
        NEW.startup_id,
        v_action,
        NEW.status,
        CASE WHEN NEW.status IN ('Verified by Admin', 'Changes Requested') THEN NEW.admin_remarks ELSE NEW.founder_remarks END,
        auth.uid(),
        CASE WHEN public.is_admin() THEN 'admin' ELSE 'founder' END
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_task_submissions_log_event ON public.task_submissions;
CREATE TRIGGER trg_task_submissions_log_event
    AFTER INSERT OR UPDATE ON public.task_submissions
    FOR EACH ROW EXECUTE FUNCTION public.task_submissions_log_event();

-- ---------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
ALTER TABLE public.milestone_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submission_events ENABLE ROW LEVEL SECURITY;

-- Programme definition: every signed-in user reads it, only admins change it
DROP POLICY IF EXISTS "Authenticated users read milestone stages" ON public.milestone_stages;
CREATE POLICY "Authenticated users read milestone stages"
    ON public.milestone_stages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage milestone stages" ON public.milestone_stages;
CREATE POLICY "Admins manage milestone stages"
    ON public.milestone_stages FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users read milestone tasks" ON public.milestone_tasks;
CREATE POLICY "Authenticated users read milestone tasks"
    ON public.milestone_tasks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage milestone tasks" ON public.milestone_tasks;
CREATE POLICY "Admins manage milestone tasks"
    ON public.milestone_tasks FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Submissions: founders see and write only their own startup's rows
DROP POLICY IF EXISTS "Founders read own task submissions" ON public.task_submissions;
CREATE POLICY "Founders read own task submissions"
    ON public.task_submissions FOR SELECT TO authenticated
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.startups s
            WHERE s.id = task_submissions.startup_id AND s.profile_id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "Founders create own task submissions" ON public.task_submissions;
CREATE POLICY "Founders create own task submissions"
    ON public.task_submissions FOR INSERT TO authenticated
    WITH CHECK (
        status IN ('In Progress', 'Submitted for Review')
        AND EXISTS (
            SELECT 1 FROM public.startups s
            WHERE s.id = task_submissions.startup_id AND s.profile_id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "Founders update own unverified task submissions" ON public.task_submissions;
CREATE POLICY "Founders update own unverified task submissions"
    ON public.task_submissions FOR UPDATE TO authenticated
    USING (
        status <> 'Verified by Admin'
        AND EXISTS (
            SELECT 1 FROM public.startups s
            WHERE s.id = task_submissions.startup_id AND s.profile_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        status IN ('In Progress', 'Submitted for Review')
        AND EXISTS (
            SELECT 1 FROM public.startups s
            WHERE s.id = task_submissions.startup_id AND s.profile_id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "Admins review task submissions" ON public.task_submissions;
CREATE POLICY "Admins review task submissions"
    ON public.task_submissions FOR UPDATE TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete task submissions" ON public.task_submissions;
CREATE POLICY "Admins delete task submissions"
    ON public.task_submissions FOR DELETE TO authenticated
    USING (public.is_admin());

-- History: read-only for clients (no insert/update/delete policies)
DROP POLICY IF EXISTS "Read own or all task submission events" ON public.task_submission_events;
CREATE POLICY "Read own or all task submission events"
    ON public.task_submission_events FOR SELECT TO authenticated
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.startups s
            WHERE s.id = task_submission_events.startup_id AND s.profile_id = (SELECT auth.uid())
        )
    );

GRANT SELECT ON public.milestone_stages, public.milestone_tasks TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.milestone_stages, public.milestone_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_submissions TO authenticated;
GRANT SELECT ON public.task_submission_events TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. PRIVATE STORAGE FOR SUPPORTING DOCUMENTS
--    Path convention: <startup_id>/<task_id>/<timestamp>-<file name>
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'progress-evidence', 'progress-evidence', false, 10485760,
    ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Progress evidence read own or admin" ON storage.objects;
CREATE POLICY "Progress evidence read own or admin"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'progress-evidence'
        AND (
            public.is_admin()
            OR EXISTS (
                SELECT 1 FROM public.startups s
                WHERE s.id::text = (storage.foldername(name))[1] AND s.profile_id = (SELECT auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Progress evidence upload own" ON storage.objects;
CREATE POLICY "Progress evidence upload own"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'progress-evidence'
        AND EXISTS (
            SELECT 1 FROM public.startups s
            WHERE s.id::text = (storage.foldername(name))[1] AND s.profile_id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "Progress evidence delete own or admin" ON storage.objects;
CREATE POLICY "Progress evidence delete own or admin"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'progress-evidence'
        AND (
            public.is_admin()
            OR EXISTS (
                SELECT 1 FROM public.startups s
                WHERE s.id::text = (storage.foldername(name))[1] AND s.profile_id = (SELECT auth.uid())
            )
        )
    );

-- ---------------------------------------------------------------------------
-- 6. REALTIME: push submission changes to open dashboards (RLS still applies)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.task_submissions;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;
