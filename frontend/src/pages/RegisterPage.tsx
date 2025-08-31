import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarIcon } from '@heroicons/react/24/outline';
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h2>
            <p className="text-gray-600 mb-8">Sign up to enjoy the feature of HD</p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Jonas Khanwald"
                  required
                />
              </div>

              {/* Date of Birth Field */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="dob"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="input pr-10"
                    required
                  />
                  <CalendarIcon className="absolute inset-y-0 right-0 pr-3 h-5 w-5 text-gray-400 flex items-center pointer-events-none" />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="jonas_kahnwald@gmail.com"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading || !name.trim() || !email.trim() || !dateOfBirth || countdown > 0}
                className="btn btn-primary w-full"
              >
                {isSubmitting || isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : countdown > 0 ? (
                  `Wait ${countdown}s`
                ) : 'Get OTP'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Sign Up Button */}
              <GoogleSignInButton
                onSuccess={handleGoogleSignUpSuccess}
                disabled={isSubmitting || isLoading}
                text="Sign up with Google"
              />

              {/* Sign in link */}
              <div className="text-center">
                <span className="text-gray-600">Already have an account?? </span>
                <Link
                  to="/"
                  className="text-primary-600 font-medium hover:text-primary-500"
                >
                  Sign In
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

export default RegisterPage;
