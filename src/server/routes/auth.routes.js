import { Router } from 'express';
import {
  sendOtp,
  verifyOtp,
  getCurrentUser,
  forgotPassword,
  createAdminUser
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/login', (_req, res) => res.status(410).json({
  success: false,
  message: 'Password authentication is handled by Supabase Auth in the web application.'
}));
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', (_req, res) => res.status(410).json({
  success: false,
  message: 'Registration is handled by Supabase Auth in the web application.'
}));
router.post('/forgot-password', forgotPassword);
router.get('/demo-credentials', (_req, res) => res.status(404).json({
  success: false,
  message: 'Demo credentials are not available.'
}));

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.post('/admin/create-admin', createAdminUser);

export default router;

