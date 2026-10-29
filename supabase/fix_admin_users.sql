-- ==============================================================================
-- 🇮🇳 VENTUREBHARAT INCUBATION PORTAL - REPAIR CORRUPTED ADMIN USERS SCRIPT
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Remove corrupted manual records from public tables and internal auth
DELETE FROM public.startups WHERE founder_email IN ('admin@venturebharat.in', 'director@venturebharat.in');
DELETE FROM public.profiles WHERE email IN ('admin@venturebharat.in', 'director@venturebharat.in');
DELETE FROM auth.identities WHERE email IN ('admin@venturebharat.in', 'director@venturebharat.in');
DELETE FROM auth.users WHERE email IN ('admin@venturebharat.in', 'director@venturebharat.in');

-- 2. Safely recreate admin@venturebharat.in with full GoTrue compatibility & active admin role
DO $$
DECLARE
    new_admin_id UUID := gen_random_uuid();
    admin_email TEXT := 'admin@venturebharat.in';
    admin_password TEXT := 'AdminPassword123!';
    encrypted_pw TEXT;
BEGIN
    -- Hash password with pgcrypto
    encrypted_pw := crypt(admin_password, gen_salt('bf'));

    -- A. Insert into auth.users with all required GoTrue attributes
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_admin_id,
        'authenticated',
        'authenticated',
        admin_email,
        encrypted_pw,
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Col. Vikramaditya Rathore","role":"admin"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    );

    -- B. Insert matching record into auth.identities (MANDATORY in Supabase GoTrue v2)
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        new_admin_id,
        new_admin_id,
        jsonb_build_object('sub', new_admin_id::text, 'email', admin_email),
        'email',
        admin_email,
        now(),
        now(),
        now()
    );

    -- C. Insert/Update public.profiles with official Incubation Director role
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        phone,
        designation,
        organization,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        new_admin_id,
        admin_email,
        'Col. Vikramaditya Rathore',
        'admin'::user_role,
        '+91 98110 54321',
        'Incubation Director & Program Officer',
        'VentureBharat Incubation Foundation (AIM/DST)',
        true,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin'::user_role,
        is_active = true,
        full_name = 'Col. Vikramaditya Rathore',
        designation = 'Incubation Director & Program Officer';

    -- D. Clean up any unintended startup entry created by trigger
    DELETE FROM public.startups WHERE profile_id = new_admin_id;

    RAISE NOTICE 'Successfully created clean admin user: % with ID: %', admin_email, new_admin_id;
END $$;

