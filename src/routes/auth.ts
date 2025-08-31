import { Router } from 'express';
import { 
  register, 
  verifyOTP, 
  resendOTP, 
  login,
  verifyLoginOTP, 
  getCurrentUser 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  registerValidation, 
  loginValidation, 
  otpValidation, 
  emailValidation 
} from '../middleware/validation.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Specific rate limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 OTP requests per minute
  message: {
    success: false,
    message: 'Too many OTP requests, please try again after a minute.'
  }
});

// Public routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/verify-otp', authLimiter, otpValidation, verifyOTP);
router.post('/resend-otp', otpLimiter, emailValidation, resendOTP);
router.post('/login', authLimiter, emailValidation, login);
router.post('/verify-login-otp', authLimiter, otpValidation, verifyLoginOTP);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;
