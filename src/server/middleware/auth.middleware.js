import jwt from 'jsonwebtoken';
import { findUserById } from '../db.js';

export const verifySupabaseAdmin = async (req, res, next) => {
  const accessToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!accessToken || !supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('your-service-role-key')) {
    return res.status(401).json({ success: false, message: 'A signed-in administrator session is required.' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data: authData, error: authError } = await client.auth.getUser(accessToken);
    if (authError || !authData?.user) {
      return res.status(401).json({ success: false, message: 'Your session is invalid or expired.' });
    }

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role, is_active')
      .eq('id', authData.user.id)
      .maybeSingle();
    if (profileError || profile?.role !== 'admin' || profile.is_active === false) {
      return res.status(403).json({ success: false, message: 'Administrator access is required.' });
    }
    req.authUser = authData.user;
    return next();
  } catch (error) {
    return res.status(503).json({ success: false, message: 'Unable to verify administrator access.' });
  }
};

const JWT_SECRET = process.env.JWT_SECRET || 'venturebharat_incubation_secret_key_2026_xyz';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account not found.'
      });
    }

    // Attach user (excluding passwordHash)
    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid or malformed authentication token.'
    });
  }
};

