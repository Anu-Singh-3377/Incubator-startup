# 🇮🇳 VentureBharat Incubation Center - Supabase Web Portal

> **National Innovation & Incubation Platform for Startups and Administrators**  
> Supported by **Startup India**, **Atal Innovation Mission (AIM - NITI Aayog)**, and the **Department of Science & Technology (DST)**, Government of India.

A full-stack, enterprise-grade authentication and incubation management portal powered by **React (Vite + Tailwind CSS)** and **Supabase (PostgreSQL + Auth + RLS)**, built specifically for:
1. **🚀 Startup People & Innovators**: Track incubation stages, apply for grant disbursements (SISFS / NIDHI-PRAYAS), manage milestones, book cleanroom testing labs, and review mentorship hours.
2. **🛡️ Incubation Center Administrators**: Evaluate cohort applications, disburse government grant tranches, manage startup directories, and broadcast official announcements.

---

## 📂 Unified Single-Folder Structure

Everything is combined into a clean, unified architecture with **one `.env`**, **one `package.json`**, and **one `node_modules`**, with all application code inside **`src/`**:

```text
incubation/
├── .env                                # 🔑 The ONLY .env file for the entire project
├── .env.example                        # The ONLY .env template file
├── index.html                          # Vite HTML entrypoint
├── package.json                        # The ONLY package.json for frontend & backend
├── package-lock.json
├── node_modules/                       # The ONLY node_modules folder
├── vite.config.js                      # Vite configuration & proxy
├── tailwind.config.js                  # Custom Indian tricolor theme & styling
├── postcss.config.js                   # PostCSS configuration
├── README.md                           # Documentation & setup guide
│
├── supabase/                           # 🗄️ Supabase PostgreSQL Configuration
│   └── schema.sql                      # Complete SQL script: tables, RLS policies, triggers, seed data
│
└── src/                                # 📁 Everything combined in a single src folder
    ├── main.jsx                        # React DOM root entry point
    ├── App.jsx                         # Main gateway & dashboard router
    ├── index.css                       # Global styles, glassmorphism & gradients
    │
    ├── lib/                            # Database & client services
    │   └── supabaseClient.js           # Supabase Auth client and role verification
    │
    ├── services/                       # API clients
    │   └── api.js                      # Auth API client
    │
    ├── components/                     # All React UI components
    │   ├── Navbar.jsx                  # Header with Tricolor ribbon & Supabase status badge
    │   ├── Footer.jsx                  # Govt affiliations (AIM, DST, SISFS, DigiLocker)
    │   ├── RoleSelector.jsx            # Dual-Gateway Switcher: Startup Innovator vs Admin
    │   ├── LoginForm.jsx               # Password Login (Supabase Auth / Email)
    │   ├── OtpLoginForm.jsx            # Mobile OTP Sign-in (+91 standard, 6-digit auto-advance)
    │   ├── QuickDemoBar.jsx            # One-click autofill credentials for Startup & Admin
    │   ├── HeroSection.jsx             # Left showcase panel (248+ startups, ₹34.8 Cr grants)
    │   ├── RegisterModal.jsx           # Cohort 2026 startup application & Supabase signup
    │   ├── ForgotPasswordModal.jsx     # Self-serve password reset modal
    │   ├── StartupDashboard.jsx        # Complete portal for incubated startup founders
    │   ├── AdminDashboard.jsx          # Complete portal for incubation directors & admins
    │   ├── SupabaseBadge.jsx           # Real-time database connection pill
    │   └── SupabaseGuideModal.jsx      # In-app step-by-step Supabase tutorial & SQL copy
    │
    └── server/                         # 🛠️ Backend API inside src
        ├── index.js                    # Express app & static production host
        ├── db.js                       # Data access & in-memory OTP cache
        ├── controllers/
        │   └── auth.controller.js      # Auth controllers
        ├── middleware/
        │   └── auth.middleware.js      # JWT token verification
        ├── routes/
        │   └── auth.routes.js          # REST endpoints
        └── data/
            └── users.json              # Local fallback persistence
```

---

## ⚙️ The Single `.env` File

All configuration lives in the single **`.env`** file at root:

```env
# ==============================================================================
# 🇮🇳 VENTUREBHARAT INCUBATION CENTER - ENVIRONMENT CONFIGURATION
# ==============================================================================

# Supabase browser credentials (publishable/anon key only)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key

# Optional: Supabase Service Role Key (Server-side administration only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=venturebharat_incubation_super_secret_jwt_key_2026
```

The app requires Supabase Auth for account creation and login. It does not authenticate using browser-stored demo credentials. The service-role key is only read by the Express server for administrator provisioning and must never be prefixed with `VITE_`.

---

## 📖 Step-by-Step: How to Connect Supabase

### Step 1: Create Your Supabase Project
1. Go to **[supabase.com](https://supabase.com)** and log in or create a free account.
2. Click **"New Project"**.
3. Set the following:
   - **Name**: `venturebharat-incubation`
   - **Database Password**: Set a strong password.
   - **Region**: Choose `ap-south-1 (Mumbai, India)` for low latency.
4. Click **"Create new project"** and wait ~1 minute for provisioning.

---

### Step 2: Run the Database Schema in Supabase SQL Editor
1. In your Supabase project dashboard, click on **SQL Editor** in the left sidebar.
2. Click **"New Query"**.
3. For a new project, run `supabase/schema.sql`, then `supabase/migration_secure_auth_roles.sql`. For an existing project with this schema, run the migration only.

#### What this script automatically creates:
- **`public.profiles`**: Stores user profiles linked to Supabase Auth (`auth.users`) with roles `startup` and `admin`.
- **`public.startups`**: Directory of incubated startups with DPIIT number, cohort, stage, grant sanctioned, grant disbursed, assigned mentor, and lab bay access.
- **`public.cohort_applications`**: Pipeline of applications submitted by candidate startups with evaluation scores, sector, and review notes.
- **`public.grant_disbursements`**: Tracks Startup India Seed Fund Scheme (SISFS) and NIDHI-PRAYAS tranches.
- **`public.incubation_announcements`**: Official notices broadcasted by incubation directors.
- **`public.facility_bookings`**: Bookings for Cleanroom bays, 3D prototyping benches, and meeting suites.
- **Row Level Security (RLS)**: Enforces access control (startups only access their own data, admins have director-level access).
- **Automated Trigger (`on_auth_user_created`)**: When any user registers or signs up through Supabase Auth, their profile and startup records are automatically created in the database.

---

### Step 3: Configure credentials and bootstrap the first administrator
1. In your Supabase Dashboard, click **Project Settings** (gear icon) ➔ **API**.
2. Copy:
   - **Project URL** (e.g. `https://xyzabcdefghijkl.supabase.co`)
   - **Publishable key** (or legacy `anon` key)
3. Open the single **`.env`** file at the root of this project, and paste your values.
4. Add the Project URL and publishable key to `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Set `SUPABASE_SERVICE_ROLE_KEY` in the server `.env` for the protected administrator provisioning endpoint. Never use this key in client code or commit it.
6. Create the first administrator identity in Supabase Authentication (email/password; confirm the email in the dashboard if needed). Then run this one-time trusted SQL Editor command, replacing the email:

```sql
SELECT public.assign_admin_role('admin@example.com');
```

The signup trigger initially assigns every new identity the `startup` role. Only the trusted SQL Editor, an already-authorized administrator, or the server service role can promote an account.

The migration also repairs `auth.users.email_change` rows that are `NULL` and normalizes future null values to an empty string, as expected by Supabase Auth.

7. Restart the server and client with `npm run dev`.

---

## Authentication test checklist

- Register a startup account with the existing registration form; check that it creates one Auth identity, one `startup` profile, and at most one linked startup row.
- Try registering the same email again; expect a duplicate-account error.
- With email confirmation enabled, confirm registration asks the user to verify email and that an unverified password login is denied by Supabase.
- Sign in with a valid startup account and the Startup portal; expect the Startup Dashboard.
- Sign in with an incorrect password; expect an inline error and no dashboard navigation.
- Sign in as a startup user through the Admin portal; expect access denied and no Admin Dashboard.
- Sign in as an authorized admin through the Admin portal; expect the Admin Dashboard.
- Try a startup profile update that changes `role` or `is_active`; expect the database trigger to reject it.
- Sign out, then open `#/admin` or `#/startup`; expect redirect to login.
- While signed in, manually open the other dashboard hash; expect redirect to the role's dashboard. Direct table/API access remains subject to RLS.

---

## 🖥️ Role-Specific Dashboard Features

### 🚀 1. Startup Innovator Dashboard (`StartupDashboard.jsx`)
When logging in as a Startup Founder, you get:
- **Startup Profile Banner**: Displays Startup Name (*KisanSetu DeepTech Labs*), DPIIT Recognition ID (*DIPP-IN-98214*), Sector, and Cohort.
- **Incubation Lifecycle Milestone Tracker**:
  - Stage 1: *Screening & Onboarding* (Completed ✅)
  - Stage 2: *Hardware Prototyping in Cleanroom Bay 4B* (Active 55% 🔄)
  - Stage 3: *Field Pilot Testing in India* (Upcoming)
  - Stage 4: *Tranche 2 Grant Disbursal* (Upcoming)
  - Stage 5: *Cohort Demo Day & Investor Pitch* (Upcoming)
- **Govt Seed Grant Tracker**:
  - Sanctioned: **₹25,00,000** (Startup India Seed Fund Scheme - SISFS)
  - Disbursed: **₹12,50,000** (Tranche 1 Cleared)
- **Tranche 2 Disbursal Claim Modal**: Submit milestone progress and upload Utilization Certificates (UC).
- **Assigned Mentor**: 1-on-1 office hour booking with *Dr. Radhika Iyer (IIT Bombay Alum)*.
- **Lab & Facility Allotment**: 24/7 biometric pass for *IoT Cleanroom Bay 4B*.
- **Directorate Noticeboard**: Real-time notices published by administrators.

---

### 🛡️ 2. Admin & Governance Dashboard (`AdminDashboard.jsx`)
When logging in as an Admin / Director, you get:
- **Executive Operations KPIs**:
  - Total Startups Incubated: **248**
  - Govt Grants Disbursed: **₹34.8 Cr**
  - Cohort 13 Applications: **418**
  - Cleanroom & Testing Bay Occupancy: **88%**
- **Cohort 13 Applications Pipeline Tab**:
  - Review applicant startups (*AgroSense Robotics*, *KavachBio Defense*, *FinSetu UPI*).
  - Inspect pitch summaries, founder contacts, evaluation scores (e.g. 94/100).
  - One-click actions: **Accept into Cohort**, **Schedule Pitch Interview**, or **Decline**.
  - All decisions update the Supabase `cohort_applications` table immediately!
- **Incubated Startups Directory Tab**:
  - Search and filter by sector (*AgriTech*, *HealthTech*, *CleanTech*, *DeepTech*).
  - Monitor milestone completion %, grant disbursed, and assigned mentor.
- **Broadcast Announcements Tab**:
  - Post urgent or normal notices directly to all startup dashboards.
  - Inserts directly into the Supabase `incubation_announcements` table.

---

## 🚀 How to Run the Application

```bash
# 1. Install dependencies (only once):
npm install

# 2. Run both Frontend and Backend concurrently with hot-reloading:
npm run dev

# 3. Or build and run production server on port 5000:
npm run build
npm start
```

- **Frontend (Vite Dev):** [http://localhost:5173](http://localhost:5173)
- **Unified Production Server & API:** [http://localhost:5000](http://localhost:5000)
