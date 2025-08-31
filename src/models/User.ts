import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  dateOfBirth?: Date;
  avatar?: string;
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  lastOTPSent?: Date;
  authProvider: 'otp';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  dateOfBirth: {
    type: Date
  },
  avatar: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  lastOTPSent: {
    type: Date,
    select: false
  },
  authProvider: {
    type: String,
    enum: ['otp'],
    required: true,
    default: 'otp'
  }
}, {
  timestamps: true,
  versionKey: false
});

// No password hashing needed for OTP-only auth

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.otp;
  delete userObject.otpExpires;
  return userObject;
};

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', userSchema);
