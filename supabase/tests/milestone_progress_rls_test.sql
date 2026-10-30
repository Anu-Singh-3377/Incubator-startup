-- ==============================================================================
-- RLS & WORKFLOW CHECK for supabase/migration_milestone_progress.sql
-- Run in the Supabase SQL Editor AFTER the migration.
--
-- 1. Find-and-replace these four placeholders with real ids from your project:
--      FOUNDER_A_UUID  auth user id of a founder (profiles.id) linked to STARTUP_A_UUID
--      STARTUP_A_UUID  startups.id whose profile_id = FOUNDER_A_UUID
--      FOUNDER_B_UUID  auth user id of a DIFFERENT founder (another startup)
--      ADMIN_UUID      auth user id of an admin (profiles.role = 'admin')
-- 2. Startup A must not already have a submission for task 'demoday.pitch'.
-- 3. Run. The final result grid lists PASS/FAIL for each check.
--    The test row it creates is deleted at the end (its history rows cascade).
-- ==============================================================================

DROP TABLE IF EXISTS pg_temp.rls_results;
CREATE TEMP TABLE rls_results (n INT, check_name TEXT, passed BOOLEAN, detail TEXT);
GRANT ALL ON rls_results TO authenticated;

-- ---------------- Founder A (owner) ----------------
SELECT set_config('request.jwt.claims', '{"sub":"FOUNDER_A_UUID","role":"authenticated"}', false);
SET ROLE authenticated;
DO $$
DECLARE v UUID;
BEGIN
    INSERT INTO public.task_submissions (startup_id, task_id, status, completion_description, completion_date)
    VALUES ('STARTUP_A_UUID', 'demoday.pitch', 'Submitted for Review', 'RLS test submission - safe to delete', current_date)
    RETURNING id INTO v;
    INSERT INTO rls_results VALUES (1, 'Founder can submit for own startup', true, v::text);

    BEGIN
        UPDATE public.task_submissions SET status = 'Verified by Admin' WHERE id = v;
        INSERT INTO rls_results VALUES (2, 'Founder cannot self-verify', false, 'update succeeded');
    EXCEPTION WHEN others THEN
        INSERT INTO rls_results VALUES (2, 'Founder cannot self-verify', true, SQLERRM);
    END;

    UPDATE public.task_submissions
       SET admin_remarks = 'forged', reviewed_by = 'FOUNDER_A_UUID', reviewed_at = now()
     WHERE id = v;
    INSERT INTO rls_results
    SELECT 3, 'Founder cannot write reviewer fields',
           admin_remarks IS NULL AND reviewed_by IS NULL AND reviewed_at IS NULL, 'checked after update'
      FROM public.task_submissions WHERE id = v;
EXCEPTION WHEN others THEN
    INSERT INTO rls_results VALUES (1, 'Founder can submit for own startup', false, SQLERRM);
END $$;
RESET ROLE;

-- ---------------- Founder B (another startup) ----------------
SELECT set_config('request.jwt.claims', '{"sub":"FOUNDER_B_UUID","role":"authenticated"}', false);
SET ROLE authenticated;
DO $$
DECLARE n INT;
BEGIN
    SELECT count(*) INTO n FROM public.task_submissions WHERE startup_id = 'STARTUP_A_UUID';
    INSERT INTO rls_results VALUES (4, 'Other founder cannot read startup A records', n = 0, n || ' rows visible');

    UPDATE public.task_submissions SET completion_description = 'tampered' WHERE startup_id = 'STARTUP_A_UUID';
    GET DIAGNOSTICS n = ROW_COUNT;
    INSERT INTO rls_results VALUES (5, 'Other founder cannot modify startup A records', n = 0, n || ' rows updated');

    BEGIN
        INSERT INTO public.task_submissions (startup_id, task_id, status, completion_description, completion_date)
        VALUES ('STARTUP_A_UUID', 'demoday.deck', 'Submitted for Review', 'forged by founder B', current_date);
        INSERT INTO rls_results VALUES (6, 'Other founder cannot create records for startup A', false, 'insert succeeded');
    EXCEPTION WHEN others THEN
        INSERT INTO rls_results VALUES (6, 'Other founder cannot create records for startup A', true, SQLERRM);
    END;

    SELECT count(*) INTO n FROM public.task_submission_events WHERE startup_id = 'STARTUP_A_UUID';
    INSERT INTO rls_results VALUES (7, 'Other founder cannot read startup A history', n = 0, n || ' rows visible');
END $$;
RESET ROLE;

-- ---------------- Admin ----------------
SELECT set_config('request.jwt.claims', '{"sub":"ADMIN_UUID","role":"authenticated"}', false);
SET ROLE authenticated;
DO $$
DECLARE r RECORD; n INT;
BEGIN
    BEGIN
        UPDATE public.task_submissions SET status = 'Changes Requested', admin_remarks = NULL
         WHERE startup_id = 'STARTUP_A_UUID' AND task_id = 'demoday.pitch';
        INSERT INTO rls_results VALUES (8, 'Changes requested needs a reason', false, 'update succeeded');
    EXCEPTION WHEN others THEN
        INSERT INTO rls_results VALUES (8, 'Changes requested needs a reason', true, SQLERRM);
    END;

    UPDATE public.task_submissions SET status = 'Verified by Admin', admin_remarks = 'RLS test verified'
     WHERE startup_id = 'STARTUP_A_UUID' AND task_id = 'demoday.pitch';
    SELECT * INTO r FROM public.task_submissions WHERE startup_id = 'STARTUP_A_UUID' AND task_id = 'demoday.pitch';
    INSERT INTO rls_results VALUES (9, 'Admin can verify; reviewer id and time set by server',
        r.status = 'Verified by Admin' AND r.reviewed_by = 'ADMIN_UUID' AND r.reviewed_at IS NOT NULL, r.status);

    SELECT count(*) INTO n FROM public.task_submission_events WHERE submission_id = r.id;
    INSERT INTO rls_results VALUES (10, 'History written by trigger (submitted + verified)', n >= 2, n || ' events');

    DELETE FROM public.task_submissions WHERE id = r.id;  -- clean up the test row
END $$;
RESET ROLE;

-- ---------------- Founder A after verification ----------------
-- (row already deleted above; this checks the founder cannot see other startups' rows at all)
SELECT set_config('request.jwt.claims', '{"sub":"FOUNDER_A_UUID","role":"authenticated"}', false);
SET ROLE authenticated;
DO $$
DECLARE n INT;
BEGIN
    SELECT count(*) INTO n FROM public.task_submissions WHERE startup_id <> 'STARTUP_A_UUID';
    INSERT INTO rls_results VALUES (11, 'Founder sees only own startup rows', n = 0, n || ' foreign rows visible');
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claims', '', false);

SELECT n AS "#", check_name, CASE WHEN passed THEN 'PASS' ELSE 'FAIL' END AS result, detail
  FROM rls_results ORDER BY n;
