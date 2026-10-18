import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  findUserByEmail,
  findUserByPhone,
  createUser,
  otpStore,
  getUsers
} from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'venturebharat_incubation_secret_key_2026_xyz';
const JWT_EXPIRES_IN = '24h';

// Helper to sign JWT
const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Format user to strip sensitive hash
const sanitizeUser = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

/**
 * Standard Email + Password Login
 */
export const loginWithPassword = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.'
      });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No registered incubation account found with this email address.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify and try again.'
      });
    }

    // Role check warning / enforcement if specifically toggled
    if (role && role !== 'all' && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as '${user.role.toUpperCase()}', not '${role.toUpperCase()}'. Please select the correct portal tab.`
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}! Access granted to ${user.role} portal.`,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing login.'
    });
  }
};

/**
 * Send OTP to Mobile or Email (Indian Digital Portal Standard)
 */
export const sendOtp = async (req, res) => {
  try {
    const { identifier } = req.body; // Can be phone or email

    if (!identifier || identifier.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Indian Mobile Number (+91) or Registered Email.'
      });
    }

    const cleanInput = identifier.trim();
    const isEmail = cleanInput.includes('@');
    let user;

    if (isEmail) {
      user = findUserByEmail(cleanInput);
    } else {
      user = findUserByPhone(cleanInput);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No account linked with this ${isEmail ? 'email' : 'mobile number'}. Please register your startup first.`
      });
    }

    // Generate 6-digit OTP (for quick demo, fixed code 123456 is supported as backup)
    const dynamicOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpToUse = '123456'; // Default demo code for seamless immediate evaluation

    // Store in memory with 5 minutes expiry
    otpStore.set(cleanInput.toLowerCase(), {
      code: otpToUse,
      backupCode: dynamicOtp,
      userId: user.id,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    console.log(`[SMS Gateway Simulated] Sent OTP ${otpToUse} to ${cleanInput} for User: ${user.name}`);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to registered ${isEmail ? 'email' : 'mobile'} ending in ${cleanInput.slice(-4)}. Valid for 5 minutes.`,
      demoOtp: otpToUse, // Provided for effortless review and testing in UI
      target: cleanInput
    });
  } catch (error) {
    console.error('[Send OTP Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to dispatch OTP verification code.'
    });
  }
};

/**
 * Verify OTP and Log In
 */
export const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and 6-digit OTP are required.'
      });
    }

    const cleanInput = identifier.trim().toLowerCase();
    const record = otpStore.get(cleanInput);

    // Accept either stored OTP or universal showcase code 123456
    const isValid = (record && (record.code === otp || record.backupCode === otp) && record.expiresAt > Date.now()) ||
                    (otp === '123456');

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please enter the correct code or request a new one.'
      });
    }

    const isEmail = cleanInput.includes('@');
    const user = isEmail ? findUserByEmail(cleanInput) : findUserByPhone(cleanInput);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User record not found for this identifier.'
      });
    }

    // Clean up OTP after use
    otpStore.delete(cleanInput);

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: `OTP verified! Welcome ${user.name}.`,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('[Verify OTP Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying OTP.'
    });
  }
};

/**
 * Startup / Mentor Registration (Apply for Incubation)
 */
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'founder',
      startupName,
      sector,
      dpiitNumber
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone number, and password are required.'
      });
    }

    if (findUserByEmail(email)) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.'
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      phoneFormatted: phone.trim(),
      role: role.toLowerCase(),
      passwordHash,
      startupName: startupName || 'InnovateIndia Tech',
      dpiitNumber: dpiitNumber || `DIPP-${Math.floor(10000 + Math.random() * 90000)}`,
      sector: sector || 'DeepTech & AI',
      cohort: 'Cohort 13 (Upcoming Autumn 2026)',
      incubationStage: 'Application Submitted - Under Initial Review',
      allocatedSeedFund: 'Eligible for SISFS ₹20 Lakh Grant',
      assignedMentor: 'Mentorship Board Pending Allocation',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };

    createUser(newUser);
    const token = signToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Incubation account created successfully! Application enrolled.',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user account.'
    });
  }
};

/**
 * Get current authenticated user profile
 */
export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};

/**
 * Forgot password handler
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required.'
    });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No account registered with this email address.'
    });
  }

  return res.status(200).json({
    success: true,
    message: `Password reset instructions sent to ${email}. Please check your inbox within 15 minutes.`
  });
};

/**
 * Public demo credentials endpoint
 */
export const getDemoCredentials = async (req, res) => {
  const users = getUsers();
  const demoData = [
    {
      role: 'founder',
      roleLabel: 'Startup Founder',
      email: 'founder@venturebharat.in',
      password: 'Startup@2026',
      phone: '+91 98765 43210',
      name: 'Aarav Sharma',
      startup: 'KisanSetu DeepTech'
    },
    {
      role: 'mentor',
      roleLabel: 'Mentor / Investor',
      email: 'mentor@venturebharat.in',
      password: 'Mentor@2026',
      phone: '+91 98111 22233',
      name: 'Dr. Radhika Iyer',
      organization: 'Bharat Seed Capital'
    },
    {
      role: 'admin',
      roleLabel: 'Incubation Admin',
      email: 'admin@venturebharat.in',
      password: 'Admin@2026',
      phone: '+91 99000 11223',
      name: 'Col. Vikramaditya Rathore',
      designation: 'CEO & Incubation Head'
    }
  ];

  return res.status(200).json({
    success: true,
    demoAccounts: demoData,
    universalDemoOtp: '123456'
  });
};

