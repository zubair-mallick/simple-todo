import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

const SmartLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [authMethod, setAuthMethod] = useState<'otp' | 'google' | null>(null);
  const [, setUserExists] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, checkAuthMethod, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignInSuccess = () => {
    navigate('/dashboard');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }

    setIsCheckingAuth(true);
    try {
      const result = await checkAuthMethod(email);
      setAuthMethod(result.authMethod as 'otp' | 'google' | null);
      setUserExists(result.userExists);

      if (result.userExists && result.authMethod === 'google') {
        // User exists and uses Google auth - show Google sign-in only
        return;
      } else if (result.userExists && result.authMethod === 'otp' && result.isVerified) {
        // User exists with OTP auth - send OTP
        await login(email);
        navigate('/verify-otp', { state: { email, isLogin: true } });
      } else if (result.userExists && !result.isVerified) {
        // User exists but not verified - redirect to verification
        navigate('/verify-otp', { state: { email, isLogin: false } });
      } else {
        // User doesn't exist - redirect to register
        navigate('/register', { state: { email } });
      }
    } catch (error) {
      // Error is handled by toast in AuthContext
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleOTPLogin = async () => {
    setIsSubmitting(true);
    try {
      await login(email);
      navigate('/verify-otp', { state: { email, isLogin: true } });
    } catch (error) {
      // Error is handled by toast in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAuthMethod(null);
    setUserExists(null);
    setEmail('');
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
          <div className="flex-1 flex items-start" style={{ paddingTop: '130px' }}>
            <div style={{ width: '399px' }}>
              {/* Text section */}
              <div className="flex flex-col justify-center gap-3 mb-[109px]">
                <h2 className="text-[40px] font-bold leading-[1.1] tracking-[-0.04em] text-[#232323] text-center">Sign in</h2>
                <p className="text-lg font-normal leading-[1.5] text-[#969696] text-left w-full">
                  {authMethod === null 
                    ? "Enter your email to get started."
                    : authMethod === 'google'
                    ? "Sign in with your Google account."
                    : "Enter the OTP sent to your email."
                  }
                </p>
              </div>

              {authMethod === null && (
                <form onSubmit={handleEmailSubmit} className="space-y-[79px]">
                  {/* Email Input */}
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
                </form>
              )}

              {/* Button and link section */}
              <div className="space-y-[30px] mt-[79px]">
                {authMethod === null && (
                  <>
                    {/* Continue Button */}
                    <button
                      type="submit"
                      onClick={handleEmailSubmit}
                      disabled={isCheckingAuth || isLoading || !email.trim()}
                      className="w-[399px] flex items-center justify-center gap-2 px-2 py-4 bg-[#367AFF] rounded-[10px] text-lg font-semibold leading-[1.2] tracking-[-0.01em] text-white disabled:opacity-50 hover:bg-[#2563eb] transition-colors"
                    >
                      {isCheckingAuth || isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Checking...
                        </>
                      ) : 'Continue'}
                    </button>

                    {/* Google Sign In Button */}
                    <GoogleSignInButton
                      onSuccess={handleGoogleSignInSuccess}
                      disabled={isCheckingAuth || isLoading}
                      text="Sign in with Google"
                      className="w-[399px] border-[#D9D9D9] text-[#232323] hover:bg-[#f9f9f9]"
                    />

                    {/* Sign up link */}
                    <div className="text-center w-[399px]">
                      <span className="text-lg font-normal leading-[1.5] text-[#6C6C6C]">Need an account? </span>
                      <Link
                        to="/register"
                        className="text-lg font-normal leading-[1.5] text-[#6C6C6C] hover:text-[#367AFF] transition-colors"
                      >
                        Create one
                      </Link>
                    </div>
                  </>
                )}

                {authMethod === 'google' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-700">
                        This email is linked to a Google account. Please sign in with Google.
                      </p>
                    </div>

                    <GoogleSignInButton
                      onSuccess={handleGoogleSignInSuccess}
                      disabled={isSubmitting || isLoading}
                      text="Sign in with Google"
                      className="w-[399px] border-[#D9D9D9] text-[#232323] hover:bg-[#f9f9f9]"
                    />

                    <div className="text-center">
                      <button
                        onClick={resetForm}
                        className="text-lg font-normal leading-[1.5] text-[#6C6C6C] hover:text-[#367AFF] transition-colors"
                      >
                        Use different email
                      </button>
                    </div>
                  </div>
                )}

                {authMethod === 'otp' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700">
                        Email: {email}
                      </p>
                    </div>

                    <button
                      onClick={handleOTPLogin}
                      disabled={isSubmitting || isLoading}
                      className="w-[399px] flex items-center justify-center gap-2 px-2 py-4 bg-[#367AFF] rounded-[10px] text-lg font-semibold leading-[1.2] tracking-[-0.01em] text-white disabled:opacity-50 hover:bg-[#2563eb] transition-colors"
                    >
                      {isSubmitting || isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending OTP...
                        </>
                      ) : 'Send OTP to Email'}
                    </button>

                    <div className="text-center">
                      <button
                        onClick={resetForm}
                        className="text-lg font-normal leading-[1.5] text-[#6C6C6C] hover:text-[#367AFF] transition-colors"
                      >
                        Use different email
                      </button>
                    </div>
                  </div>
                )}
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
          <h1 className="text-2xl font-bold leading-[1.1] tracking-[-0.04em] text-[#232323] text-center mb-4">Sign in</h1>
          
          {/* Subtitle */}
          <div className="text-center mb-8">
            <p className="text-base font-normal leading-[1.5] text-[#969696]">
              {authMethod === null 
                ? "Enter your email to get started."
                : authMethod === 'google'
                ? "Sign in with your Google account."
                : "Enter the OTP sent to your email."
              }
            </p>
          </div>

          {authMethod === null && (
            <>
              {/* Email Input */}
              <div className="relative mb-6">
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

              {/* Continue Button */}
              <button
                type="submit"
                onClick={handleEmailSubmit}
                disabled={isCheckingAuth || isLoading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 px-2 py-4 bg-[#367AFF] rounded-[10px] text-lg font-semibold leading-[1.2] tracking-[-0.01em] text-white disabled:opacity-50 hover:bg-[#2563eb] transition-colors mb-6"
              >
                {isCheckingAuth || isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </>
                ) : 'Continue'}
              </button>

              {/* Google Sign In Button */}
              <GoogleSignInButton
                onSuccess={handleGoogleSignInSuccess}
                disabled={isCheckingAuth || isLoading}
                text="Sign in with Google"
                className="border-[#D9D9D9] text-[#232323] hover:bg-[#f9f9f9]"
              />

              {/* Sign up link */}
              <div className="text-center mt-6">
                <span className="text-lg font-normal leading-[1.5] text-[#6C6C6C]">Need an account? </span>
                <Link
                  to="/register"
                  className="text-lg font-normal leading-[1.5] text-[#6C6C6C] hover:text-[#367AFF] transition-colors"
                >
                  Create one
                </Link>
              </div>
            </>
          )}

          {authMethod === 'google' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  This email is linked to a Google account. Please sign in with Google.
                </p>
              </div>

              <GoogleSignInButton
                onSuccess={handleGoogleSignInSuccess}
                disabled={isSubmitting || isLoading}
                text="Sign in with Google"
                className="border-[#D9D9D9] text-[#232323] hover:bg-[#f9f9f9]"
              />

              <div className="text-center">
                <button
                  onClick={resetForm}
                  className="text-lg font-normal leading-[1.5] text-[#6C6C6C] hover:text-[#367AFF] transition-colors"
                >
                  Use different email
                </button>
              </div>
            </div>
          )}

          {authMethod === 'otp' && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  Email: {email}
                </p>
              </div>

              <button
                onClick={handleOTPLogin}
                disabled={isSubmitting || isLoading}
                className="w-full flex items-center justify-center gap-2 px-2 py-4 bg-[#367AFF] rounded-[10px] text-lg font-semibold leading-[1.2] tracking-[-0.01em] text-white disabled:opacity-50 hover:bg-[#2563eb] transition-colors"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : 'Send OTP to Email'}
              </button>

              <div className="text-center">
                <button
                  onClick={resetForm}
                  className="text-lg font-normal leading-[1.5] text-[#6C6C6C] hover:text-[#367AFF] transition-colors"
                >
                  Use different email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center pb-4">
          <div className="w-[134px] h-[5px] bg-black rounded-full"></div>
        </div>
      </div>
    </>
  );
};

export default SmartLoginPage;
