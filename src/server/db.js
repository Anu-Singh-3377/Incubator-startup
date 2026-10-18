import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, './data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory OTP store with TTL
export const otpStore = new Map();

// Default seeded users for demonstration and testing
const getInitialUsers = () => {
  const salt = bcrypt.genSaltSync(10);
  return [
    {
      id: 'usr_founder_01',
      name: 'Aarav Sharma',
      email: 'founder@venturebharat.in',
      phone: '+919876543210',
      phoneFormatted: '+91 98765 43210',
      role: 'founder',
      passwordHash: bcrypt.hashSync('Startup@2026', salt),
      startupName: 'KisanSetu DeepTech Labs',
      dpiitNumber: 'DIPP-IN-98214',
      sector: 'AgriTech & Edge AI',
      cohort: 'Cohort 12 (Spring 2026)',
      incubationStage: 'Active Incubation (Prototype to Pilot)',
      allocatedSeedFund: '₹25,00,000 (SISFS / NIDHI-PRAYAS)',
      assignedMentor: 'Dr. Radhika Iyer',
      labAccess: 'IoT & Cleanroom Bay 4B',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-15T10:00:00.000Z'
    },
    {
      id: 'usr_mentor_01',
      name: 'Dr. Radhika Iyer',
      email: 'mentor@venturebharat.in',
      phone: '+919811122233',
      phoneFormatted: '+91 98111 22233',
      role: 'mentor',
      passwordHash: bcrypt.hashSync('Mentor@2026', salt),
      organization: 'Bharat Seed Capital & IIT Alum Ventures',
      designation: 'Managing Partner & Executive-in-Residence',
      domainExpertise: 'DeepTech, AgriRobotics, IP & Patent Commercialization',
      assignedStartupsCount: 6,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T09:30:00.000Z'
    },
    {
      id: 'usr_admin_01',
      name: 'Col. Vikramaditya Rathore',
      email: 'admin@venturebharat.in',
      phone: '+919900011223',
      phoneFormatted: '+91 99000 11223',
      role: 'admin',
      passwordHash: bcrypt.hashSync('Admin@2026', salt),
      organization: 'VentureBharat Incubation Foundation (AIM / DST)',
      designation: 'CEO & Head of Incubation Initiatives',
      department: 'Central Incubation Management & Govt Grant Liaison',
      accessLevel: 'Super Administrator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T08:00:00.000Z'
    }
  ];
};

export const initDb = () => {
  if (!fs.existsSync(USERS_FILE)) {
    const initialUsers = getInitialUsers();
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf-8');
    console.log('[DB] Initialized database with default seeded users');
  }
};

export const getUsers = () => {
  try {
    initDb();
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[DB Error] Failed to read users file:', err);
    return [];
  }
};

export const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[DB Error] Failed to save users:', err);
    return false;
  }
};

export const findUserByEmail = (email) => {
  const users = getUsers();
  const normalized = email.toLowerCase().trim();
  return users.find((u) => u.email.toLowerCase() === normalized);
};

export const findUserByPhone = (phone) => {
  const users = getUsers();
  // Strip non-digit characters for matching
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return users.find((u) => u.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10)));
};

export const findUserById = (id) => {
  const users = getUsers();
  return users.find((u) => u.id === id);
};

export const createUser = (userData) => {
  const users = getUsers();
  users.push(userData);
  saveUsers(users);
  return userData;
};

// Initialize DB on import
initDb();

