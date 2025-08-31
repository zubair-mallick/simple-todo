import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OTPVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyOTP, resendOTP, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    try {
      setError('');
      await verifyOTP(email, code);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      setError('');
      await resendOTP(email);
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      setError(error.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter verification code
              </label>
              <div className="flex space-x-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={() => handleVerify()}
                disabled={isLoading || otp.some(digit => !digit)}
                className="btn btn-primary w-full py-2 px-4 text-sm font-medium disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>

            <div className="text-center text-sm">
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Resend verification code
                </button>
              ) : (
                <p className="text-gray-500">
                  Resend code in {formatTime(countdown)}
                </p>
              )}
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                ← Back to registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
