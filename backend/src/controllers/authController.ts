import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import { User, IUser } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { generateOTP, getOTPExpiration, sendOTPEmail, sendWelcomeEmail } from '../utils/email.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleTokenPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
  email_verified: boolean;
}

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

    const { name, email, password } = req.body;

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

    // Create user
    const user = new User({
      name,
      email,
      password,
      authProvider: 'email',
      otp,
      otpExpires,
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
    const token = generateToken(user._id, user.email);

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

    const user = await User.findOne({ email });
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

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = getOTPExpiration();

    user.otp = otp;
    user.otpExpires = otpExpires;
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

// Login with email and password
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

    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check if user registered with email provider
    if (user.authProvider !== 'email') {
      res.status(400).json({
        success: false,
        message: 'Please login with Google'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
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

    // Generate JWT token
    const token = generateToken(user._id, user.email);

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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Google OAuth login
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
      return;
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload() as GoogleTokenPayload;
    
    if (!payload || !payload.email_verified) {
      res.status(400).json({
        success: false,
        message: 'Invalid Google token or email not verified'
      });
      return;
    }

    // Check if user exists
    let user = await User.findOne({ email: payload.email });

    if (user) {
      // Update existing user with Google info if needed
      if (user.authProvider === 'email') {
        res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please login with email and password.'
        });
        return;
      }

      // Update Google info
      user.googleId = payload.sub;
      user.avatar = payload.picture || user.avatar;
      user.name = payload.name || user.name;
      user.isVerified = true;
      await user.save();
    } else {
      // Create new user
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        avatar: payload.picture,
        authProvider: 'google',
        isVerified: true
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
    const token = generateToken(user._id, user.email);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
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
    console.error('Google auth error:', error);
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
