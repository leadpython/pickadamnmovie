'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/store';

interface ValidationState {
  handle: boolean;
  betaKey: boolean;
  passwordsMatch: boolean;
  isFormValid: boolean;
}

export default function SignUp() {
  const router = useRouter();
  const setSession = useStore((state) => state.setSession);
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handleMessage, setHandleMessage] = useState('');
  const [isValidatingHandle, setIsValidatingHandle] = useState(false);

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
      // Validate handle format
      const handleRegex = /^[a-z0-9_.]+$/;
      const isHandleFormatValid = handleRegex.test(debouncedHandle);
      
      if (!isHandleFormatValid && debouncedHandle) {
        setHandleMessage('Handle can only contain lowercase letters, numbers, underscores, and dots');
        setValidation(prev => ({
          ...prev,
          handle: false,
          isFormValid: false
        }));
        setIsValidatingHandle(false);
        return;
      }

      if (debouncedHandle.length < 3) {
        setHandleMessage('Handle must be at least 3 characters');
        setValidation(prev => ({
          ...prev,
          handle: false,
          isFormValid: false
        }));
        setIsValidatingHandle(false);
        return;
      }

      setIsValidatingHandle(true);
      try {
        // Check handle availability
        const response = await fetch('/api/movie-night-group/check-handle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ handle: debouncedHandle }),
        });

        const data = await response.json();
        
        // Update handle message based on availability
        if (data.available === false) {
          setHandleMessage('Handle is already taken!');
          setValidation(prev => ({
            ...prev,
            handle: false,
            isFormValid: false
          }));
        } else {
          setHandleMessage('Handle is available!');
          // Simulate beta key validation
          const isBetaKeyValid = debouncedBetaKey.length >= 6;
          setValidation(prev => ({
            ...prev,
            handle: true,
            betaKey: isBetaKeyValid,
            isFormValid: true && isBetaKeyValid && prev.passwordsMatch && groupName.length > 0
          }));
        }
      } catch (error) {
        console.error('Error checking handle availability:', error);
        setHandleMessage('Error checking handle availability');
        setValidation(prev => ({
          ...prev,
          handle: false,
          isFormValid: false
        }));
      } finally {
        setIsValidatingHandle(false);
      }
    };

    if (debouncedHandle) {
      validateDebouncedFields();
    }
  }, [debouncedHandle, debouncedBetaKey, groupName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'handle') {
      // Convert to lowercase and remove any invalid characters
      const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9_.]/g, '');
      setHandle(sanitizedValue);
      setHandleMessage(''); // Clear handle message when typing
    } else if (name === 'groupName') {
      setGroupName(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else if (name === 'betaKey') {
      setBetaKey(value);
    }
    
    // Reset error when user makes changes
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/movie-night-group/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle, groupName, password, betaKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Store session in Zustand store
      setSession(data.sessionId, data.group);

      // Redirect to main page after successful signup
      router.push('/main');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
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
                  onChange={handleChange}
                />
                {!isValidatingHandle && handle && !validation.handle && (
                  <p className="mt-1 text-sm text-red-600">{handleMessage}</p>
                )}
                {!isValidatingHandle && handle && validation.handle && (
                  <p className="mt-1 text-sm text-green-600">{handleMessage}</p>
                )}
                {isValidatingHandle && (
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !validation.isFormValid}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                validation.isFormValid
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  : 'bg-gray-400 cursor-not-allowed'
              } focus:outline-none transition-colors duration-200`}
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 