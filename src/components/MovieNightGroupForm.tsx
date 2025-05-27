'use client';

import { useState, useRef } from 'react';
import { validateBetaKey, validateHandle, createMovieNightGroup } from '@/services';
import { useStore } from '@/store/store';

interface MovieNightGroupFormProps {
  onSubmit?: (groupData: { name: string; password: string; handle: string; betakey: string }) => void;
}

type FormMode = 'signup' | 'signin';

export default function MovieNightGroupForm({ onSubmit }: MovieNightGroupFormProps) {
  const setMovieNightGroup = useStore(state => state.setMovieNightGroup);
  const [mode, setMode] = useState<FormMode>('signup');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [betakey, setBetakey] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isValidatingBetaKey, setIsValidatingBetaKey] = useState(false);
  const [isValidatingHandle, setIsValidatingHandle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [betaKeyStatus, setBetaKeyStatus] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const [handleStatus, setHandleStatus] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const submitAttempted = useRef(false);

  const validateBetaKeyInput = async (value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, betakey: 'Beta key is required' }));
      setBetaKeyStatus(null);
      return false;
    }

    setIsValidatingBetaKey(true);
    setBetaKeyStatus(null);
    try {
      const result = await validateBetaKey(value);
      if (!result.isValid) {
        setErrors(prev => ({ ...prev, betakey: 'Invalid beta key' }));
        setBetaKeyStatus({ isValid: false, message: 'Invalid beta key' });
        return false;
      }
      if (result.inUse) {
        setErrors(prev => ({ ...prev, betakey: 'Beta key is already in use' }));
        setBetaKeyStatus({ isValid: false, message: 'Beta key is already in use' });
        return false;
      }
      setErrors(prev => ({ ...prev, betakey: '' }));
      setBetaKeyStatus({ isValid: true, message: 'Beta key is valid!' });
      return true;
    } catch (error) {
      setErrors(prev => ({ ...prev, betakey: 'Error validating beta key' }));
      setBetaKeyStatus({ isValid: false, message: 'Error validating beta key' });
      return false;
    } finally {
      setIsValidatingBetaKey(false);
    }
  };

  const validateHandleInput = async (value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, handle: 'Handle is required' }));
      setHandleStatus(null);
      return false;
    }

    setIsValidatingHandle(true);
    setHandleStatus(null);
    try {
      const result = await validateHandle(value);
      if (!result.isValid) {
        setErrors(prev => ({ ...prev, handle: 'Invalid handle' }));
        setHandleStatus({ isValid: false, message: 'Invalid handle' });
        return false;
      }
      if (result.isTaken) {
        setErrors(prev => ({ ...prev, handle: 'Handle is already taken' }));
        setHandleStatus({ isValid: false, message: 'Handle is already taken' });
        return false;
      }
      setErrors(prev => ({ ...prev, handle: '' }));
      setHandleStatus({ isValid: true, message: 'Handle is available!' });
      return true;
    } catch (error) {
      setErrors(prev => ({ ...prev, handle: 'Error validating handle' }));
      setHandleStatus({ isValid: false, message: 'Error validating handle' });
      return false;
    } finally {
      setIsValidatingHandle(false);
    }
  };

  const isFormValid = () => {
    if (mode === 'signin') {
      return handle.trim() !== '' && password.trim() !== '';
    }
    return (
      name.trim() !== '' &&
      password.trim() !== '' &&
      betakey.trim() !== '' &&
      handle.trim() !== '' &&
      !errors.betakey &&
      !errors.handle
    );
  };

  const validateForm = async () => {
    const newErrors: { [key: string]: string } = {};
    
    if (mode === 'signup') {
      if (!name.trim()) newErrors.name = 'Name is required';
      if (!betakey.trim()) newErrors.betakey = 'Beta key is required';
      if (!handle.trim()) newErrors.handle = 'Handle is required';
    }
    
    if (!password.trim()) newErrors.password = 'Password is required';
    if (!handle.trim()) newErrors.handle = 'Handle is required';

    setErrors(newErrors);
    
    if (mode === 'signup') {
      // Validate beta key and handle only in signup mode
      const isBetaKeyValid = await validateBetaKeyInput(betakey);
      const isHandleValid = await validateHandleInput(handle);
      return Object.keys(newErrors).length === 0 && isBetaKeyValid && isHandleValid;
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (submitAttempted.current || isSubmitting) {
      return;
    }
    
    submitAttempted.current = true;
    setIsSubmitting(true);
    
    try {
      if (await validateForm()) {
        if (mode === 'signup') {
          // Validate beta key and handle one final time before submission
          const betaKeyResult = await validateBetaKey(betakey);
          const handleResult = await validateHandle(handle);
          
          if (!betaKeyResult.isValid || betaKeyResult.inUse) {
            setBetaKeyStatus({
              isValid: false,
              message: betaKeyResult.inUse ? 'Beta key is already in use' : 'Invalid beta key'
            });
            return;
          }

          if (!handleResult.isValid || handleResult.isTaken) {
            setHandleStatus({
              isValid: false,
              message: handleResult.isTaken ? 'Handle is already taken' : 'Invalid handle'
            });
            return;
          }

          // Create the movie night group
          const groupData = { name, password, handle, betakey };
          const newGroup = await createMovieNightGroup(groupData);
          
          // Update the store with the new group data
          setMovieNightGroup(newGroup);
        } else {
          // Sign in logic
          const response = await fetch('/api/signin-movie-night-group', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ handle, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to sign in');
          }

          const { group } = await response.json();
          setMovieNightGroup(group);
        }
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to process request'
      }));
    } finally {
      setIsSubmitting(false);
      // Reset the submission flag after a short delay
      setTimeout(() => {
        submitAttempted.current = false;
      }, 1000);
    }
  };

  const handleBetaKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBetakey(value);
    setBetaKeyStatus(null);
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, betakey: 'Beta key is required' }));
    }
  };

  const handleBetaKeyBlur = async () => {
    if (betakey.trim()) {
      await validateBetaKeyInput(betakey);
    }
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setHandle(value);
    setHandleStatus(null);
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, handle: 'Handle is required' }));
    }
  };

  const handleHandleBlur = async () => {
    if (handle.trim()) {
      await validateHandleInput(handle);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'signup' ? 'signin' : 'signup');
    setErrors({});
    setBetaKeyStatus(null);
    setHandleStatus(null);
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg relative">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">{mode === 'signup' ? 'Creating your movie night group...' : 'Signing in...'}</p>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 italic">
            {mode === 'signup' ? 'Create a movie night group to get started.' : 'Sign in to your movie night group.'}
          </p>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {mode === 'signup' ? 'Create Movie Night Group' : 'Sign In to Movie Night Group'}
        </h2>
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="betakey" className="block text-sm font-medium text-gray-700 mb-1">
                  Beta Key
                </label>
                <input
                  id="betakey"
                  name="betakey"
                  type="text"
                  required
                  value={betakey}
                  onChange={handleBetaKeyChange}
                  onBlur={handleBetaKeyBlur}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    errors.betakey ? 'border-red-500' : betaKeyStatus?.isValid ? 'border-green-500' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter your beta key"
                  disabled={isSubmitting}
                />
                {isValidatingBetaKey && (
                  <p className="mt-1 text-sm text-gray-500">Validating beta key...</p>
                )}
                {betaKeyStatus && (
                  <p className={`mt-1 text-sm ${betaKeyStatus.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {betaKeyStatus.message}
                  </p>
                )}
                {errors.betakey && !betaKeyStatus && <p className="mt-1 text-sm text-red-600">{errors.betakey}</p>}
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter group name"
                  disabled={isSubmitting}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
            </>
          )}
          <div>
            <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-1">
              Group Handle
            </label>
            <input
              id="handle"
              name="handle"
              type="text"
              required
              value={handle}
              onChange={handleHandleChange}
              onBlur={handleHandleBlur}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.handle ? 'border-red-500' : handleStatus?.isValid ? 'border-green-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter group handle"
              disabled={isSubmitting}
            />
            {isValidatingHandle && (
              <p className="mt-1 text-sm text-gray-500">Validating handle...</p>
            )}
            {handleStatus && (
              <p className={`mt-1 text-sm ${handleStatus.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {handleStatus.message}
              </p>
            )}
            {errors.handle && !handleStatus && <p className="mt-1 text-sm text-red-600">{errors.handle}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'signup' ? 'Group Password' : 'Password'}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder={mode === 'signup' ? "Create a password for group access" : "Enter your password"}
              disabled={isSubmitting}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            {mode === 'signup' && (
              <p className="mt-1 text-sm text-gray-500">Share this password with your movie night group members</p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isFormValid() && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  : 'bg-gray-400 cursor-not-allowed'
              } focus:outline-none`}
            >
              {isSubmitting 
                ? (mode === 'signup' ? 'Creating...' : 'Signing in...') 
                : (mode === 'signup' ? 'Create Group' : 'Sign In')}
            </button>
            {errors.submit && (
              <p className="mt-2 text-sm text-red-600 text-center">{errors.submit}</p>
            )}
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {mode === 'signup' 
                ? 'Already have a group? Sign in' 
                : "Don't have a group? Create one"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}