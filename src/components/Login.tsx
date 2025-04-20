import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setErrorMessage('Invalid email or password. Please try again.');
        } else {
          setErrorMessage(error.message);
        }
        throw error;
      }
    } catch (error) {
      // Error is already handled above
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage('Account created successfully! You can now log in.');
        setIsSignUp(false);
        // Clear the form
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage('Password reset instructions have been sent to your email.');
        setIsResettingPassword(false);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-96">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Vision Assist</h1>
        
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{errorMessage}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-green-500 text-sm">{successMessage}</p>
          </div>
        )}

        {isResettingPassword ? (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label className="block text-white text-xl mb-2" htmlFor="reset-email">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 text-xl bg-gray-700 rounded-lg text-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white text-xl font-bold p-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
            <button
              type="button"
              onClick={() => setIsResettingPassword(false)}
              className="w-full bg-gray-700 text-white text-xl font-bold p-4 rounded-lg hover:bg-gray-600 transition duration-200 mt-2"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-6">
            <div>
              <label className="block text-white text-xl mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 text-xl bg-gray-700 rounded-lg text-white"
                required
              />
            </div>
            <div className="relative">
              <label className="block text-white text-xl mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 text-xl bg-gray-700 rounded-lg text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-12 text-white"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
            {isSignUp && (
              <div className="relative">
                <label className="block text-white text-xl mb-2" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-4 text-xl bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white text-xl font-bold p-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
            </button>
            <div className="flex flex-col space-y-4">
              <button
                type="button"
                onClick={toggleMode}
                className="w-full text-blue-400 text-center hover:text-blue-300 transition duration-200"
              >
                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </button>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setIsResettingPassword(true)}
                  className="w-full text-blue-400 text-center hover:text-blue-300 transition duration-200"
                >
                  Forgot your password?
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}