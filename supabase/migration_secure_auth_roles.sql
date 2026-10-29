-- Secure role assignment for Supabase Auth users. Run after schema.sql.
-- Public registrations always receive startup; admin provisioning is server-side only.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(lower(email));

CREATE OR REPLACE VIEW public.admin_users AS
SELECT id, email, full_name, role, phone, avatar_url, designation, organization,
       is_active, created_at, updated_at
FROM public.profiles
WHERE role = 'admin'::public.user_role AND is_active = true;

-- GoTrue expects email_change to be an empty string when no email change is
-- pending. Repair legacy NULLs and normalize future Admin API-created users.
UPDATE auth.users SET email_change = '' WHERE email_change IS NULL;
CREATE OR REPLACE FUNCTION public.normalize_auth_email_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.email_change := COALESCE(NEW.email_change, '');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS normalize_auth_email_change ON auth.users;
CREATE TRIGGER normalize_auth_email_change
  BEFORE INSERT OR UPDATE OF email_change ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.normalize_auth_email_change();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'::public.user_role
      AND COALESCE(p.is_active, true)
  );
$$;

-- A signed-in user may edit profile details, but only a trusted server can
-- change role or active status. A database owner can still administer via SQL.
CREATE OR REPLACE FUNCTION public.protect_profile_authorization_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;
DROP TRIGGER IF EXISTS trg_enforce_profile_role_protection ON public.profiles;
CREATE TRIGGER trg_enforce_profile_role_protection
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_authorization_fields();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  full_name_value text;
  startup_name_value text;
  sector_value text;
  phone_value text;
  dpiit_value text;
BEGIN
  full_name_value := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1));
  startup_name_value := COALESCE(NULLIF(NEW.raw_user_meta_data->>'startup_name', ''), 'Innovative Labs Bharat');
  sector_value := COALESCE(NULLIF(NEW.raw_user_meta_data->>'sector', ''), 'DeepTech & AI');
  phone_value := NULLIF(NEW.raw_user_meta_data->>'phone', '');
  dpiit_value := NULLIF(NEW.raw_user_meta_data->>'dpiit_number', '');

  INSERT INTO public.profiles (id, email, full_name, role, phone, designation, organization)
  VALUES (NEW.id, NEW.email, full_name_value, 'startup'::public.user_role, phone_value, 'Founder & CEO', startup_name_value)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.startups (profile_id, startup_name, sector, dpiit_number, cohort, stage, founder_name, founder_email, founder_phone)
  VALUES (NEW.id, startup_name_value, sector_value, dpiit_value, 'Cohort 12 (Spring 2026)', 'Incubated', full_name_value, NEW.email, phone_value)
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Only admins or service_role may use this explicit promotion helper.
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE target_id uuid;
BEGIN
  IF COALESCE((auth.jwt() ->> 'role') = 'service_role', false) IS NOT TRUE
     AND COALESCE(current_setting('role', true), '') NOT IN ('postgres', 'supabase_admin')
     AND public.is_admin() IS NOT TRUE THEN
    RAISE EXCEPTION 'Only an authorized administrator can assign the admin role.';
  END IF;
  SELECT id INTO target_id FROM public.profiles WHERE lower(email) = lower(trim(target_email));
  IF target_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User with email not found in profiles table.');
  END IF;
  UPDATE public.profiles SET role = 'admin'::public.user_role,
    designation = 'Incubation Director & Program Officer',
    organization = 'VentureBharat Incubation Foundation (AIM/DST)', is_active = true
  WHERE id = target_id;
  DELETE FROM public.startups WHERE profile_id = target_id;
  RETURN jsonb_build_object('success', true, 'user_id', target_id);
END;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles can be read by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be read by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile or admins can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile details" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own startup profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Users can read own profile or admins can read profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY "Users can update own profile details"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY "Users can create own startup profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()) AND role = 'startup'::public.user_role);
CREATE POLICY "Admins can manage profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.admin_users FROM PUBLIC, anon, authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.assign_admin_role(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_admin_role(text) TO authenticated, service_role;
