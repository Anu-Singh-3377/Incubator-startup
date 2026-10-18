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
    │   └── supabaseClient.js           # Supabase client & zero-config Demo Mode fallback
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

# Supabase Project Credentials (from your Supabase Dashboard: Settings -> API)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-public-key-here

# Optional: Supabase Service Role Key (Server-side administration only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key-here

# Backend Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=venturebharat_incubation_super_secret_jwt_key_2026
```

> ⚡ **Zero-Friction Demo Mode**: If you leave the placeholder values as they are, the application automatically launches in **Supabase Demo Mode** with realistic pre-seeded data, letting you test immediately without any errors!

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
3. Open the file **`supabase/schema.sql`** located in this repository, copy its entire contents, paste it into the editor, and click **"Run"**.

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

### Step 3: Copy Your Supabase API Keys
1. In your Supabase Dashboard, click **Project Settings** (gear icon) ➔ **API**.
2. Copy:
   - **Project URL** (e.g. `https://xyzabcdefghijkl.supabase.co`)
   - **Project API Key (`anon` / `public`)**
3. Open the single **`.env`** file at the root of this project, and paste your values.
4. Save the file and restart your dev server (`npm run dev`). The top navbar badge will change from **"Demo Mode"** to **"Supabase Live"**!

---

## 🔑 Pre-Seeded Accounts for Testing

| Role Gateway | Email | Password | Phone (for OTP) | Portal Access |
| :--- | :--- | :--- | :--- | :--- |
| **🚀 Startup Innovator** | `founder@venturebharat.in` | `Startup@2026` | `+91 98765 43210` | KisanSetu DeepTech Labs (Cohort 12) |
| **🛡️ Incubation Admin** | `admin@venturebharat.in` | `Admin@2026` | `+91 99000 11223` | Col. Vikramaditya Rathore (CEO & Director) |

> 💡 **Demo OTP Code:** Enter `123456` or click the "Fill Demo OTP" button when in OTP login mode.

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
