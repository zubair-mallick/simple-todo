import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { register, isLoading } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !dateOfBirth || !email || countdown > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, dateOfBirth);
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      // Error is handled by toast in AuthContext
      // Only set countdown if there was an error and user stays on this page
      setCountdown(30);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Desktop Design */}
      <div className="hidden lg:flex w-[1440px] h-[1024px] bg-white rounded-[32px] border border-[#333333] mx-auto">
        {/* Left Column */}
        <div className="flex flex-col self-stretch p-8" style={{ width: '591px' }}>
          {/* Top section with logo */}
          <div className="flex flex-col self-stretch gap-2.5" style={{ height: 'auto' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 relative">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M0 0H32V20.08H0V0Z" fill="#367AFF"/>
                  <path d="M20.75 17.78L29.41 27.1V17.78H20.75Z" fill="#367AFF"/>
                  <path d="M17.77 20.83H23.24V31.15H17.77V20.83Z" fill="#367AFF"/>
                  <path d="M11.96 22.55H17.65V32H11.96V22.55Z" fill="#367AFF"/>
                  <path d="M4.92 20.77H14.16V29.42H4.92V20.77Z" fill="#367AFF"/>
                  <path d="M0.86 17.77H11.24V23.27H0.86V17.77Z" fill="#367AFF"/>
                </svg>
              </div>
              <span className="text-2xl font-semibold leading-[1.1] tracking-[-0.04em] text-[#232323]">HD</span>
            </div>
          </div>

          {/* Content positioned exactly like Figma */}
          <div className="flex-1" style={{ paddingTop: '60px' }}>
            <div style={{ width: '399px' }}>
              {/* Text section */}
              <div className="flex flex-col gap-3 mb-8">
                <h2 className="text-[40px] font-bold leading-[1.1] tracking-[-0.04em] text-[#232323] text-center">Sign up</h2>
                <p className="text-lg font-normal leading-[1.5] text-[#969696] text-left w-full">Sign up to enjoy the feature of HD</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="relative">
                  <div className="flex items-center gap-0.5 px-4 py-4 border-[1.5px] border-[#D9D9D9] rounded-[10px] w-[399px]">
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 text-lg font-normal leading-[1.5] text-[#232323] bg-transparent border-none outline-none placeholder:text-[#232323]"
                      placeholder="Jonas Khanwald"
                      required
                    />
                  </div>
                  <div className="absolute bg-white px-1" style={{ left: '12px', top: '-10.5px' }}>
                    <span className="text-sm font-medium leading-[1.5] text-[#9A9A9A]">Your Name</span>
                  </div>
                </div>

                {/* Date of Birth Field */}
                <div className="relative">
                  <div className="flex items-center gap-2.5 px-4 py-4 border-[1.5px] border-[#D9D9D9] rounded-[10px] w-[399px]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#232323]">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <input
                      type="date"
                      id="dob"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="flex-1 text-lg font-normal leading-[1.5] text-[#232323] bg-transparent border-none outline-none"
                      placeholder="11 December 1997"
                      required
                    />
                  </div>
                  <div className="absolute bg-white px-1" style={{ left: '12px', top: '-10.5px' }}>
                    <span className="text-sm font-medium leading-[1.5] text-[#9A9A9A]">Date of Birth</span>
                  </div>
                </div>

                {/* Email Field */}
                <div className="relative">
                  <div className="flex items-center gap-0.5 px-4 py-4 border-[1.5px] border-[#367AFF] rounded-[10px] w-[399px]">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 text-lg font-normal leading-[1.5] text-[#232323] bg-transparent border-none outline-none placeholder:text-[#232323]"
                      placeholder="jonas_kahnwald@gmail.com"
                      required
                    />
                    <span className="text-lg font-light leading-[1.5] text-[#232323]">|</span>
                  </div>
                  <div className="absolute bg-white px-1" style={{ left: '12px', top: '-10.5px' }}>
                    <span className="text-sm font-medium leading-[1.5] text-[#367AFF]">Email</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading || !name.trim() || !email.trim() || !dateOfBirth || countdown > 0}
                  className="w-[399px] flex items-center justify-center gap-2 px-2 py-4 bg-[#367AFF] rounded-[10px] text-lg font-semibold leading-[1.2] tracking-[-0.01em] text-white disabled:opacity-50 hover:bg-[#2563eb] transition-colors"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : countdown > 0 ? (
                    `Wait ${countdown}s`
                  ) : (
                    'Get OTP'
                  )}
                </button>
              </form>

              {/* Sign in link */}
              <div className="text-center mt-6">
                <span className="text-lg font-normal leading-[1.5] text-[#6C6C6C]">Already have an account?? </span>
                <Link
                  to="/"
                  className="text-lg font-normal leading-[1.5] text-[#6C6C6C] hover:text-[#367AFF] transition-colors"
                >
                  Sign in
                </Link>
              </div>

              {/* Google Sign Up Button */}
              <div className="mt-6">
                <GoogleSignInButton
                  onSuccess={handleGoogleSignUpSuccess}
                  disabled={isSubmitting || isLoading}
                  text="Sign up with Google"
                  className="w-[399px] border-[#D9D9D9] text-[#232323] hover:bg-[#f9f9f9]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Background */}
        <div className="flex justify-stretch items-stretch gap-2.5 p-3" style={{ width: '849px' }}>
          <div 
            className="flex-1 rounded-[24px]" 
            style={{
              background: 'linear-gradient(135deg, #367AFF 0%, #9333EA 100%)',
            }}
          >
            {/* Background container matching Figma */}
          </div>
        </div>
      </div>

      {/* Mobile Design */}
      <div className="lg:hidden w-full min-h-screen bg-white rounded-[9px] border border-[#333333] flex flex-col">
        {/* Status Bar */}
        <div className="flex justify-between items-center px-8 py-4 text-white">
          <span className="text-base font-semibold leading-[1.2] tracking-[-0.04em]">9:41</span>
          <div className="flex items-center gap-1">
            {/* Mobile signal, wifi, battery icons */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect x="0" y="8" width="3" height="4" fill="white"/>
              <rect x="4" y="6" width="3" height="6" fill="white"/>
              <rect x="8" y="4" width="3" height="8" fill="white"/>
              <rect x="12" y="2" width="3" height="10" fill="white"/>
            </svg>
          </div>
        </div>

        {/* Logo */}
        <div className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M0 0H32V20.08H0V0Z" fill="#367AFF"/>
                <path d="M20.75 17.78L29.41 27.1V17.78H20.75Z" fill="#367AFF"/>
                <path d="M17.77 20.83H23.24V31.15H17.77V20.83Z" fill="#367AFF"/>
                <path d="M11.96 22.55H17.65V32H11.96V22.55Z" fill="#367AFF"/>
                <path d="M4.92 20.77H14.16V29.42H4.92V20.77Z" fill="#367AFF"/>
                <path d="M0.86 17.77H11.24V23.27H0.86V17.77Z" fill="#367AFF"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-8">
          {/* Title */}
          <h1 className="text-2xl font-bold leading-[1.1] tracking-[-0.04em] text-[#232323] text-center mb-4">Sign up</h1>
          
          {/* Subtitle */}
          <div className="text-center mb-8">
            <p className="text-base font-normal leading-[1.5] text-[#969696]">Sign up to enjoy the feature of HD</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="relative">
              <div className="flex items-center gap-0.5 px-4 py-4 border-[1.5px] border-[#D9D9D9] rounded-[10px]">
                <input
                  type="text"
                  id="name-mobile"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 text-base font-normal leading-[1.5] text-[#232323] bg-transparent border-none outline-none placeholder:text-[#232323]"
                  placeholder="Jonas Khanwald"
                  required
                />
              </div>
              <div className="absolute bg-white px-1" style={{ left: '12px', top: '-10.5px' }}>
                <span className="text-sm font-medium leading-[1.5] text-[#9A9A9A]">Your Name</span>
              </div>
            </div>

            {/* Date of Birth Field */}
            <div className="relative">
              <div className="flex items-center gap-2.5 px-4 py-4 border-[1.5px] border-[#D9D9D9] rounded-[10px]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#232323]">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="date"
                  id="dob-mobile"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="flex-1 text-base font-normal leading-[1.5] text-[#232323] bg-transparent border-none outline-none"
                  required
                />
              </div>
              <div className="absolute bg-white px-1" style={{ left: '12px', top: '-10.5px' }}>
                <span className="text-sm font-medium leading-[1.5] text-[#9A9A9A]">Date of Birth</span>
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
              <div className="flex items-center gap-0.5 px-4 py-4 border-[1.5px] border-[#367AFF] rounded-[10px]">
                <input
                  type="email"
                  id="email-mobile"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 text-base font-normal leading-[1.5] text-[#232323] bg-transparent border-none outline-none placeholder:text-[#232323]"
                  placeholder="jonas_kahnwald@gmail.com"
                  required
                />
                <span className="text-base font-light leading-[1.5] text-[#232323]">|</span>
              </div>
              <div className="absolute bg-white px-1" style={{ left: '12px', top: '-10.5px' }}>
                <span className="text-sm font-medium leading-[1.5] text-[#367AFF]">Email</span>
              </div>
            </div>

            {/* OTP Input - disabled as shown in Figma */}
            <div className="relative">
              <div className="flex items-center gap-2.5 px-4 py-4 border border-[#D9D9D9] rounded-[10px]">
                <span className="flex-1 text-base font-normal leading-[1.5] text-[#9A9A9A]">OTP</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#9A9A9A]">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !name.trim() || !email.trim() || !dateOfBirth || countdown > 0}
              className="w-full flex items-center justify-center gap-2 px-2 py-4 bg-[#367AFF] rounded-[10px] text-lg font-semibold leading-[1.2] tracking-[-0.01em] text-white disabled:opacity-50 hover:bg-[#2563eb] transition-colors"
            >
              {isSubmitting || isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : countdown > 0 ? (
                `Wait ${countdown}s`
              ) : (
                'Sign up'
              )}
            </button>
          </form>

          {/* Already have account link */}
          <div className="text-center mt-6">
            <span className="text-lg font-normal leading-[1.5] text-[#6C6C6C]">Already have an account?? </span>
            <Link
              to="/"
              className="text-lg font-normal leading-[1.5] text-[#6C6C6C] hover:text-[#367AFF] transition-colors"
            >
              Sign in
            </Link>
          </div>
          
          {/* Google Sign Up Button */}
          <div className="mt-6">
            <GoogleSignInButton
              onSuccess={handleGoogleSignUpSuccess}
              disabled={isSubmitting || isLoading}
              text="Sign up with Google"
              className="border-[#D9D9D9] text-[#232323] hover:bg-[#f9f9f9]"
            />
          </div>
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center pb-4">
          <div className="w-[134px] h-[5px] bg-black rounded-full"></div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
