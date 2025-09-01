import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import logoIcon from '../assets/icon.svg';
import bgImage from '../assets/bgimage.jpg';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const { register, verifyOTP, resendOTP, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignUpSuccess = () => {
    navigate('/dashboard');
  };

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !dateOfBirth || !email) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, dateOfBirth);
      setStep('otp');
      setCountdown(30); // Start countdown for resend
    } catch (error) {
      // Error is handled by toast in AuthContext
      setCountdown(30);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || !email) {
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOTP(email, otp);
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
      setCountdown(30);
    } catch (error) {
      // Error handled by resendOTP function
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = step === 'register' ? handleRegisterSubmit : handleOtpSubmit;

  return (
    <>
      {/* Desktop Design - matches Figma exactly */}
      <div className="hidden lg:flex w-full h-screen overflow-hidden">
        {/* Left Column - Form Section */}
        <div className="w-1/2 bg-white flex flex-col justify-center px-16">
          {/* Logo */}
          <div className="absolute top-8 left-16">
            <div className="flex items-center gap-3">
              <img src={logoIcon} alt="Logo" className="w-8 h-8" />
              <span className="text-2xl font-semibold leading-[1.1] tracking-[-0.04em] text-[#232323]">HD</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="max-w-sm mx-auto w-full">
            {/* Title */}
            <h1 className="text-4xl font-bold text-[#232323] mb-2">Sign up</h1>
            <p className="text-[#969696] text-lg mb-8">Sign up to enjoy the feature of HD</p>

            {step === 'register' ? (
              // Registration Form
              <>
                {/* Name Input */}
                <div className="relative mb-6">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-[#9A9A9A] font-medium">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-4 border border-[#D9D9D9] rounded-lg text-lg outline-none"
                    placeholder="Jonas Khanwald"
                    required
                  />
                </div>

                {/* Date of Birth Input */}
                <div className="relative mb-6">
                  <label className="absolute -top-2 left-12 bg-white px-1 text-sm text-[#9A9A9A] font-medium z-10">Date of Birth</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-[#D9D9D9] rounded-lg text-lg outline-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      required
                    />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#232323] pointer-events-none">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>

                {/* Email Input */}
                <div className="relative mb-8">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-[#367AFF] font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-[#367AFF] rounded-lg text-lg outline-none"
                    placeholder="jonas_kahnwald@gmail.com"
                    required
                  />
                </div>
              </>
            ) : (
              // OTP Verification
              <>
                {/* Name Input - Disabled */}
                <div className="relative mb-6">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-[#9A9A9A] font-medium">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    className="w-full px-4 py-4 border border-[#D9D9D9] rounded-lg text-lg outline-none bg-gray-50"
                    disabled
                  />
                </div>

                {/* Date of Birth Input - Disabled */}
                <div className="relative mb-6">
                  <label className="absolute -top-2 left-12 bg-white px-1 text-sm text-[#9A9A9A] font-medium z-10">Date of Birth</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateOfBirth}
                      className="w-full pl-12 pr-4 py-4 border border-[#D9D9D9] rounded-lg text-lg outline-none bg-gray-50"
                      disabled
                    />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9A9A9A] pointer-events-none">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>

                {/* Email Input - Disabled */}
                <div className="relative mb-6">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-[#9A9A9A] font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    className="w-full px-4 py-4 border border-[#D9D9D9] rounded-lg text-lg outline-none bg-gray-50"
                    disabled
                  />
                </div>

                {/* OTP Input */}
                <div className="relative mb-4">
                  <input
                    type={showOtp ? 'text' : 'password'}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-[#367AFF] rounded-lg text-lg outline-none bg-white"
                    placeholder="Enter OTP"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    {showOtp ? (
                      // Open eye icon when OTP is visible
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#367AFF]">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      // Closed eye icon when OTP is hidden
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#367AFF]">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Resend OTP */}
                <div className="mb-8">
                  <button 
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || isResending}
                    className={`text-sm font-medium ${
                      countdown > 0 || isResending 
                        ? 'text-[#9A9A9A] cursor-not-allowed' 
                        : 'text-[#367AFF] hover:underline cursor-pointer'
                    }`}
                  >
                    {isResending ? (
                      'Sending...'
                    ) : countdown > 0 ? (
                      `Resend OTP in ${countdown}s`
                    ) : (
                      'Resend OTP'
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={
                isSubmitting || isLoading || 
                (step === 'register' && (!name.trim() || !email.trim() || !dateOfBirth)) ||
                (step === 'otp' && !otp.trim())
              }
              className="w-full bg-[#367AFF] text-white py-4 rounded-lg text-lg font-semibold mb-6 disabled:opacity-50 hover:bg-[#2563eb] transition-colors"
            >
              {isSubmitting || isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {step === 'register' ? 'Creating account...' : 'Verifying...'}
                </>
              ) : step === 'register' ? (
                'Sign up'
              ) : (
                'Verify & Complete Signup'
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center mb-6">
              <div className="flex-1 h-px bg-[#D9D9D9]"></div>
              <span className="px-4 text-sm text-[#969696] font-medium">or</span>
              <div className="flex-1 h-px bg-[#D9D9D9]"></div>
            </div>

            {/* Google Sign-Up Button */}
            <div className="mb-6">
              <GoogleSignInButton
                onSuccess={handleGoogleSignUpSuccess}
                disabled={isSubmitting || isLoading}
                text="Sign up with Google"
                className="w-full border-[#D9D9D9] text-[#232323] hover:bg-[#f9f9f9]"
              />
            </div>

            {/* Sign in link */}
            <p className="text-center text-[#6C6C6C]">
              Already have an account?{' '}
              <Link
                to="/"
                className="text-[#367AFF] hover:underline underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column - Background Image */}
        <div className="w-1/2 relative overflow-hidden p-3">
          <img 
            src={bgImage} 
            alt="Background" 
            className="w-full h-full object-cover rounded-3xl"
          />
        </div>
      </div>

      {/* Mobile Design - matches LoginPage style with proper step functionality */}
      <div className="lg:hidden w-full min-h-screen bg-white flex flex-col">
        {/* Logo - centered with top padding */}
        <div className="flex justify-center pt-16 pb-8">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="Logo" className="w-8 h-8" />
            <span className="text-2xl font-semibold leading-[1.1] tracking-[-0.04em] text-[#232323]">HD</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6">
          {/* Title */}
          <h1 className="text-4xl font-bold leading-[1.1] tracking-[-0.04em] text-[#232323] text-center mb-4">Sign up</h1>
          
          {/* Subtitle */}
          <div className="text-center mb-12">
            <p className="text-base font-normal leading-[1.5] text-[#969696]">Sign up to enjoy the feature of HD</p>
          </div>

          {step === 'register' ? (
            // Registration Form
            <>
              {/* Name Input */}
              <div className="relative mb-8">
                <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-[#9A9A9A] font-medium">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-5 border border-[#D9D9D9] rounded-2xl text-lg outline-none"
                  placeholder="Jonas Khanwald"
                  required
                />
              </div>

              {/* Date of Birth Input */}
              <div className="relative mb-8">
                <label className="absolute -top-2 left-12 bg-white px-1 text-sm text-[#9A9A9A] font-medium z-10">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-12 pr-4 py-5 border border-[#D9D9D9] rounded-2xl text-lg outline-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    required
                  />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#232323] pointer-events-none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>

              {/* Email Input */}
              <div className="relative mb-12">
                <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-[#367AFF] font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-5 border-2 border-[#367AFF] rounded-2xl text-lg outline-none"
                  placeholder="jonas_kahnwald@gmail.com"
                  required
                />
              </div>
            </>
          ) : (
            // OTP Verification Step
            <>
              {/* Name Input - Disabled */}
              <div className="relative mb-6">
                <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-[#9A9A9A] font-medium">Your Name</label>
                <input
                  type="text"
                  value={name}
                  className="w-full px-4 py-5 border border-[#D9D9D9] rounded-2xl text-lg outline-none bg-gray-50"
                  disabled
                />
              </div>

              {/* Date of Birth Input - Disabled */}
              <div className="relative mb-6">
                <label className="absolute -top-2 left-12 bg-white px-1 text-sm text-[#9A9A9A] font-medium z-10">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateOfBirth}
                    className="w-full pl-12 pr-4 py-5 border border-[#D9D9D9] rounded-2xl text-lg outline-none bg-gray-50"
                    disabled
                  />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9A9A9A] pointer-events-none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>

              {/* Email Input - Disabled */}
              <div className="relative mb-6">
                <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-[#9A9A9A] font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  className="w-full px-4 py-5 border border-[#D9D9D9] rounded-2xl text-lg outline-none bg-gray-50"
                  disabled
                />
              </div>

              {/* OTP Input */}
              <div className="relative mb-6">
                <input
                  type={showOtp ? 'text' : 'password'}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-5 border-2 border-[#367AFF] rounded-2xl text-lg outline-none bg-white"
                  placeholder="OTP"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowOtp(!showOtp)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  {showOtp ? (
                    // Open eye icon when OTP is visible
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#367AFF]">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    // Closed eye icon when OTP is hidden
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#367AFF]">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Resend OTP */}
              <div className="mb-8">
                <button 
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isResending}
                  className={`text-sm font-medium underline ${
                    countdown > 0 || isResending 
                      ? 'text-[#9A9A9A] cursor-not-allowed' 
                      : 'text-[#367AFF] hover:underline cursor-pointer'
                  }`}
                >
                  {isResending ? (
                    'Sending...'
                  ) : countdown > 0 ? (
                    `Resend OTP in ${countdown}s`
                  ) : (
                    'Resend OTP'
                  )}
                </button>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={
              isSubmitting || isLoading || 
              (step === 'register' && (!name.trim() || !email.trim() || !dateOfBirth)) ||
              (step === 'otp' && !otp.trim())
            }
            className="w-full bg-[#367AFF] text-white py-5 rounded-2xl text-lg font-semibold mb-8 disabled:opacity-50 hover:bg-[#2563eb] transition-colors"
          >
            {isSubmitting || isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {step === 'register' ? 'Creating account...' : 'Verifying...'}
              </>
            ) : step === 'register' ? (
              'Sign up'
            ) : (
              'Verify & Complete Signup'
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center mb-8">
            <div className="flex-1 h-px bg-[#D9D9D9]"></div>
            <span className="px-4 text-sm text-[#969696] font-medium">or</span>
            <div className="flex-1 h-px bg-[#D9D9D9]"></div>
          </div>

          {/* Google Sign Up Button */}
          <GoogleSignInButton
            onSuccess={handleGoogleSignUpSuccess}
            disabled={isSubmitting || isLoading}
            text="Sign up with Google"
            className="border-[#D9D9D9] text-[#232323] hover:bg-[#f9f9f9] rounded-2xl mb-8"
          />

          {/* Sign in link */}
          <div className="text-center">
            <span className="text-base font-normal leading-[1.5] text-[#969696]">Already have an account? </span>
            <Link
              to="/"
              className="text-base font-normal leading-[1.5] text-[#367AFF] hover:underline underline"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center py-4">
          <div className="w-[134px] h-[5px] bg-black rounded-full"></div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
