import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import logoIcon from '../assets/icon.svg';
import bgImage from '../assets/bgimage.jpg';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignInSuccess = () => {
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
    
    if (!email || countdown > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email);
      navigate('/verify-otp', { state: { email, isLogin: true } });
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
            <h1 className="text-4xl font-bold text-[#232323] mb-2">Sign in</h1>
            <p className="text-[#969696] text-lg mb-8">Please login to continue to your account.</p>

            {/* Email Input */}
            <div className="relative mb-6">
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

            {/* OTP Input */}
            <div className="relative mb-4">
              <input
                type="password"
                className="w-full px-4 py-4 border border-[#D9D9D9] rounded-lg text-lg outline-none bg-gray-50"
                placeholder="OTP"
                disabled
              />
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#9A9A9A]">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Resend OTP */}
            <div className="mb-6">
              <button className="text-[#367AFF] hover:underline text-sm font-medium">Resend OTP</button>
            </div>

            {/* Keep me logged in */}
            <div className="flex items-center gap-2 mb-8">
              <input 
                type="checkbox" 
                id="keepLoggedIn" 
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="keepLoggedIn" className="text-sm text-[#232323]">Keep me logged in</label>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading || !email.trim() || countdown > 0}
              className="w-full bg-[#367AFF] text-white py-4 rounded-lg text-lg font-semibold mb-6 disabled:opacity-50 hover:bg-[#2563eb] transition-colors"
            >
              {isSubmitting || isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending OTP...
                </>
              ) : countdown > 0 ? (
                `Wait ${countdown}s`
              ) : (
                'Sign in'
              )}
            </button>

            {/* Create account link */}
            <p className="text-center text-[#6C6C6C]">
              Need an account?{' '}
              <Link
                to="/register"
                className="text-[#367AFF] hover:underline underline font-medium"
              >
                Create one
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

      {/* Mobile Design - matches Figma exactly */}
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
          <h1 className="text-4xl font-bold leading-[1.1] tracking-[-0.04em] text-[#232323] text-center mb-4">Sign In</h1>
          
          {/* Subtitle */}
          <div className="text-center mb-12">
            <p className="text-base font-normal leading-[1.5] text-[#969696]">Please login to continue to your account.</p>
          </div>

          {/* Email Input */}
          <div className="relative mb-8">
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

          {/* OTP Input */}
          <div className="relative mb-6">
            <input
              type="password"
              className="w-full px-4 py-5 border border-[#D9D9D9] rounded-2xl text-lg outline-none bg-gray-50"
              placeholder="OTP"
              disabled
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#9A9A9A]">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Resend OTP */}
          <div className="mb-8">
            <button className="text-[#367AFF] hover:underline text-sm font-medium underline">Resend OTP</button>
          </div>

          {/* Keep me logged in */}
          <div className="flex items-center gap-3 mb-12">
            <input 
              type="checkbox" 
              id="keepLoggedInMobile" 
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              className="w-5 h-5 border-2 border-black rounded-sm"
            />
            <label htmlFor="keepLoggedInMobile" className="text-base text-[#232323] font-medium">Keep me logged in</label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading || !email.trim() || countdown > 0}
            className="w-full bg-[#367AFF] text-white py-5 rounded-2xl text-lg font-semibold mb-8 disabled:opacity-50 hover:bg-[#2563eb] transition-colors"
          >
            {isSubmitting || isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending OTP...
              </>
            ) : countdown > 0 ? (
              `Wait ${countdown}s`
            ) : (
              'Sign In'
            )}
          </button>

          {/* Create account link */}
          <div className="text-center mb-8">
            <span className="text-base font-normal leading-[1.5] text-[#969696]">Need an account?? </span>
            <Link
              to="/register"
              className="text-base font-normal leading-[1.5] text-[#367AFF] hover:underline underline"
            >
              Create one
            </Link>
          </div>
          
          {/* Google Sign In Button */}
          <GoogleSignInButton
            onSuccess={handleGoogleSignInSuccess}
            disabled={isSubmitting || isLoading}
            text="Sign in with Google"
            className="border-[#D9D9D9] text-[#232323] hover:bg-[#f9f9f9] rounded-2xl"
          />
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center py-4">
          <div className="w-[134px] h-[5px] bg-black rounded-full"></div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
