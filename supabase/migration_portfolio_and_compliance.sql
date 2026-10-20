-- ==============================================================================
-- 🇮🇳 VENTUREBHARAT INCUBATION CENTER - MIGRATION SCRIPT
-- Adds Portfolio Management & Compliance Document columns to Supabase
-- Safe and Idempotent: Uses IF NOT EXISTS
-- ==============================================================================

-- 1. Add Portfolio Management Fields to public.startups
ALTER TABLE public.startups 
    ADD COLUMN IF NOT EXISTS company_overview TEXT,
    ADD COLUMN IF NOT EXISTS mca_number TEXT,
    ADD COLUMN IF NOT EXISTS incorporation_date DATE,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Alumni', 'Graduated'));

-- 2. Create Compliance Documents Table for Portfolio Tracker
CREATE TABLE IF NOT EXISTS public.compliance_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'Certificate of Incorporation', 'MCA Registration', 'PAN / Tax ID', 'DPIIT Certificate', 'Audited UC'
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

-- 3. Enable RLS on compliance_documents
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for compliance_documents
DO $$ BEGIN
    CREATE POLICY "Startups can view their own compliance documents"
        ON public.compliance_documents FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.startups
                WHERE startups.id = compliance_documents.startup_id AND startups.profile_id = auth.uid()
            ) OR public.is_admin()
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to compliance documents"
        ON public.compliance_documents FOR ALL
        TO authenticated
        USING (public.is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Startups can insert or update their own compliance documents"
        ON public.compliance_documents FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.startups
                WHERE startups.id = compliance_documents.startup_id AND startups.profile_id = auth.uid()
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

