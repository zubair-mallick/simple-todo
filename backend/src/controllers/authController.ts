import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User, IUser } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { generateOTP, getOTPExpiration, sendOTPEmail, sendWelcomeEmail } from '../utils/email.js';
import { verifyFirebaseToken } from '../config/firebase.js';

// Register with email
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const { name, email, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = getOTPExpiration();
    const now = new Date();

    // Create user
    const user = new User({
      name,
      email,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      authProvider: 'otp',
      otp,
      otpExpires,
      lastOTPSent: now,
      isVerified: false
    });

    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Delete the user if email fails
      await User.findByIdAndDelete(user._id);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for OTP verification.',
      data: {
        userId: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
      return;
    }

    if (!user.otp || !user.otpExpires) {
      res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
      return;
    }

    if (user.otpExpires < new Date()) {
      res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
      return;
    }

    if (user.otp !== otp) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
      return;
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Generate JWT token
    const token = generateToken(user._id as any, user.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          authProvider: user.authProvider
        },
        token
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const { email } = req.body;

    const user = await User.findOne({ email }).select('+otp +otpExpires +lastOTPSent');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if this is a registration resend (user not verified) or login resend (user verified)
    // For registration: user should not be verified
    // For login: user should be verified and have an active OTP session
    
    console.log('ResendOTP Debug:', {
      isVerified: user.isVerified,
      hasOTP: !!user.otp,
      hasOTPExpires: !!user.otpExpires,
      email: user.email
    });
    
    // Check for 30-second rate limiting
    const now = new Date();
    const RATE_LIMIT_SECONDS = 30;
    
    if (user.lastOTPSent) {
      const timeSinceLastOTP = (now.getTime() - user.lastOTPSent.getTime()) / 1000; // in seconds
      if (timeSinceLastOTP < RATE_LIMIT_SECONDS) {
        const remainingSeconds = Math.ceil(RATE_LIMIT_SECONDS - timeSinceLastOTP);
        res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`
        });
        return;
      }
    }
    
    if (!user.isVerified) {
      // This is a registration resend - user not verified yet, this is fine
      console.log('Registration resend scenario - user not verified yet');
    } else {
      // This is a login resend - user is verified, check if they have an active login OTP session
      console.log('Login resend scenario - checking for active OTP session');
      if (!user.otp || !user.otpExpires) {
        console.log('No active OTP session found');
        res.status(400).json({
          success: false,
          message: 'No active login session found. Please try logging in again.'
        });
        return;
      }
      
      console.log('Active OTP session found, allowing resend');
      // Check if the OTP has expired, if so, we should allow generating a new one
      // (this is handled below in the main logic)
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = getOTPExpiration();

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.lastOTPSent = now;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login with email (send OTP)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+lastOTPSent');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        message: 'Please verify your email first'
      });
      return;
    }
    
    // Check for 30-second rate limiting
    const now = new Date();
    const RATE_LIMIT_SECONDS = 30;
    
    if (user.lastOTPSent) {
      const timeSinceLastOTP = (now.getTime() - user.lastOTPSent.getTime()) / 1000; // in seconds
      if (timeSinceLastOTP < RATE_LIMIT_SECONDS) {
        const remainingSeconds = Math.ceil(RATE_LIMIT_SECONDS - timeSinceLastOTP);
        res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`
        });
        return;
      }
    }

    // Generate OTP for login
    const otp = generateOTP();
    const otpExpires = getOTPExpiration();

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.lastOTPSent = now;
    await user.save();

    // Send OTP email
    try {
      console.log(`Attempting to send OTP to ${email}`);
      await sendOTPEmail(email, otp);
      console.log(`OTP sent successfully to ${email}`);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      
      // For development/testing, log the OTP so you can still test
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🚨 EMAIL FAILED - OTP for ${email}: ${otp} (valid for 10 minutes)`);
        res.status(200).json({
          success: true,
          message: 'Login OTP generated. Check server logs for OTP (email service unavailable).',
          ...(process.env.NODE_ENV !== 'production' && { otp }) // Include OTP in response for development
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Email service temporarily unavailable. Please try again later.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Login OTP sent to your email successfully'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify login OTP
export const verifyLoginOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        message: 'Please verify your email first'
      });
      return;
    }

    if (!user.otp || !user.otpExpires) {
      res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new login OTP.'
      });
      return;
    }

    if (user.otpExpires < new Date()) {
      res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
      return;
    }

    if (user.otp !== otp) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
      return;
    }

    // Clear OTP after successful login
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id as any, user.email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          authProvider: user.authProvider
        },
        token
      }
    });
  } catch (error) {
    console.error('Login OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


// Get current user
export const getCurrentUser = async (req: Request & { user?: { userId: string } }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          authProvider: user.authProvider,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Google Authentication
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        success: false,
        message: 'Firebase ID token is required'
      });
      return;
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await verifyFirebaseToken(idToken);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid Firebase token'
      });
      return;
    }

    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required for authentication'
      });
      return;
    }

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: uid }
      ]
    });

    if (user) {
      // User exists, check if they need to update their auth provider
      if (user.authProvider === 'otp' && !user.googleId) {
        // User registered with OTP, now logging in with Google - link accounts
        user.googleId = uid;
        user.authProvider = 'google';
        if (picture) user.avatar = picture;
        await user.save();
      } else if (user.authProvider === 'google' && user.googleId !== uid) {
        // Different Google account
        res.status(400).json({
          success: false,
          message: 'This email is associated with a different Google account'
        });
        return;
      }
    } else {
      // Create new user
      user = new User({
        name: name || 'User',
        email: email,
        googleId: uid,
        avatar: picture || null,
        authProvider: 'google',
        isVerified: true // Google accounts are pre-verified
      });

      await user.save();

      // Send welcome email
      try {
        await sendWelcomeEmail(user.email, user.name);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }

    // Generate JWT token
    const token = generateToken(user._id as any, user.email);

    res.status(200).json({
      success: true,
      message: user.createdAt.getTime() === user.updatedAt.getTime() ? 'Account created successfully' : 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          authProvider: user.authProvider
        },
        token
      }
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check auth method for email
export const checkAuthMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        data: {
          authMethod: null,
          userExists: false
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User found',
      data: {
        authMethod: user.authProvider,
        userExists: true,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Check auth method error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
