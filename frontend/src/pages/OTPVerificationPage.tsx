import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const OTPVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { verifyOTP, verifyLoginOTP, resendOTP, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const isLogin = location.state?.isLogin || false;

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || !email) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await verifyLoginOTP(email, otp);
      } else {
        await verifyOTP(email, otp);
      }
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by toast in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || isResending) return;
    
    setIsResending(true);
    try {
      await resendOTP(email);
      // Start 30 second countdown after successful resend
      setCountdown(30);
    } catch (error) {
      // Error handled by resendOTP function
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="flex items-center mb-16">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">HD</span>
          </div>

          {/* Form */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Verify Login' : 'Verify Email'}
            </h2>
            <p className="text-gray-600 mb-8">
              {isLogin 
                ? 'Please enter the OTP sent to your email to complete login.' 
                : 'Please enter the OTP sent to your email to verify your account.'}
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="input bg-gray-50"
                  value={email}
                  readOnly
                />
              </div>

              {/* OTP Field */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  OTP
                </label>
                <div className="relative">
                  <input
                    type={showOtp ? 'text' : 'password'}
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="input pr-10"
                    placeholder="Enter OTP"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowOtp(!showOtp)}
                  >
                    {showOtp ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading || otp.length === 0}
                className="btn btn-primary w-full"
              >
                {isSubmitting || isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (isLogin ? 'Verify & Login' : 'Verify & Complete Signup')}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isResending}
                  className={`font-medium ${
                    countdown > 0 || isResending 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-primary-600 hover:text-primary-500'
                  }`}
                >
                  {isResending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : countdown > 0 ? (
                    `Resend OTP in ${countdown}s`
                  ) : (
                    'Resend OTP'
                  )}
                </button>
                {countdown > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    You can request a new OTP in {countdown} seconds
                  </p>
                )}
              </div>

              {/* Back link */}
              <div className="text-center">
                <span className="text-gray-600">Want to go back? </span>
                <Link
                  to={isLogin ? "/" : "/register"}
                  className="text-primary-600 font-medium hover:text-primary-500"
                >
                  {isLogin ? 'Login' : 'Register'}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Abstract Design */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800">
          {/* Abstract wave pattern */}
          <div className="absolute inset-0 opacity-30">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 200C50 150 100 100 150 120C200 140 250 180 300 160C350 140 400 100 400 120V400H0V200Z"
                fill="url(#gradient1)"
              />
              <path
                d="M0 250C60 200 120 150 180 170C240 190 300 230 360 210C380 200 400 180 400 190V400H0V250Z"
                fill="url(#gradient2)"
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(59,130,246,0.8)" />
                  <stop offset="100%" stopColor="rgba(37,99,235,0.6)" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(37,99,235,0.6)" />
                  <stop offset="100%" stopColor="rgba(29,78,216,0.8)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
