'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import useDebounce from '@/hooks/useDebounce';

interface ValidationState {
  handle: boolean;
  betaKey: boolean;
  passwordsMatch: boolean;
  isFormValid: boolean;
}

export default function SignUp() {
  const [handle, setHandle] = useState('');
  const [groupName, setGroupName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [betaKey, setBetaKey] = useState('');
  const [validation, setValidation] = useState<ValidationState>({
    handle: true,
    betaKey: true,
    passwordsMatch: true,
    isFormValid: false
  });

  // Debounce handle and beta key values
  const debouncedHandle = useDebounce(handle, 1000);
  const debouncedBetaKey = useDebounce(betaKey, 1000);

  // Simulate real-time validation for passwords and group name
  useEffect(() => {
    const validateForm = async () => {
      // Check if passwords match
      const doPasswordsMatch = password === confirmPassword && password.length >= 8;

      setValidation(prev => ({
        ...prev,
        passwordsMatch: doPasswordsMatch,
        isFormValid: prev.handle && prev.betaKey && doPasswordsMatch && groupName.length > 0
      }));
    };

    validateForm();
  }, [password, confirmPassword, groupName]);

  // Simulate debounced validation for handle and beta key
  useEffect(() => {
    const validateDebouncedFields = async () => {
      // Simulate handle availability check
      const isHandleAvailable = debouncedHandle.length >= 3;
      
      // Simulate beta key validation
      const isBetaKeyValid = debouncedBetaKey.length >= 6;

      setValidation(prev => ({
        ...prev,
        handle: isHandleAvailable,
        betaKey: isBetaKeyValid,
        isFormValid: isHandleAvailable && isBetaKeyValid && prev.passwordsMatch && groupName.length > 0
      }));
    };

    validateDebouncedFields();
  }, [debouncedHandle, debouncedBetaKey, groupName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isFormValid) return;
    
    // TODO: Implement sign up logic
    console.log('Sign up:', { handle, groupName, password, betaKey });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <Image
            src="/pickadamnmovie.png"
            alt="Pick A Damn Movie"
            width={200}
            height={200}
            className="mx-auto"
          />
          <p className="mt-2 text-center text-lg text-gray-600 font-medium">
            Finally, somebody picks a damn movie.
          </p>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="handle" className="block text-sm font-medium text-gray-700">
                Handle
              </label>
              <div className="mt-1">
                <input
                  id="handle"
                  name="handle"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    handle ? (validation.handle ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter your handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                />
                {handle === debouncedHandle && handle && !validation.handle && (
                  <p className="mt-1 text-sm text-red-600">Handle is already taken!</p>
                )}
                {handle === debouncedHandle && handle && validation.handle && (
                  <p className="mt-1 text-sm text-green-600">Handle is available!</p>
                )}
                {handle && handle !== debouncedHandle && (
                  <p className="mt-1 text-sm text-gray-500">Checking availability...</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
                Group Name
              </label>
              <div className="mt-1">
                <input
                  id="groupName"
                  name="groupName"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    password ? (password.length >= 8 ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {password && password.length < 8 && (
                  <p className="mt-1 text-sm text-red-600">Password must be at least 8 characters</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    confirmPassword ? (validation.passwordsMatch ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && !validation.passwordsMatch && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="betaKey" className="block text-sm font-medium text-gray-700">
                Beta Key
              </label>
              <div className="mt-1">
                <input
                  id="betaKey"
                  name="betaKey"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    betaKey ? (validation.betaKey ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter your beta key"
                  value={betaKey}
                  onChange={(e) => setBetaKey(e.target.value)}
                />
                {betaKey === debouncedBetaKey && betaKey && !validation.betaKey && (
                  <p className="mt-1 text-sm text-red-600">Invalid beta key</p>
                )}
                {betaKey === debouncedBetaKey && betaKey && validation.betaKey && (
                  <p className="mt-1 text-sm text-green-600">Valid beta key!</p>
                )}
                {betaKey && betaKey !== debouncedBetaKey && (
                  <p className="mt-1 text-sm text-gray-500">Validating beta key...</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={!validation.isFormValid}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                validation.isFormValid
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  : 'bg-gray-400 cursor-not-allowed'
              } focus:outline-none transition-colors duration-200`}
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 