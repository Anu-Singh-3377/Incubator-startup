import { Router } from 'express';
import {
  loginWithPassword,
  sendOtp,
  verifyOtp,
  register,
  getCurrentUser,
  forgotPassword,
  getDemoCredentials
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/login', loginWithPassword);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.get('/demo-credentials', getDemoCredentials);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

export default router;

