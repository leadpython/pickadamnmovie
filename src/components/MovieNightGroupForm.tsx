'use client';

import { useState, useRef } from 'react';
import { validateBetaKey, createMovieNightGroup } from '@/services';
import { useStore } from '@/store/store';

interface MovieNightGroupFormProps {
  onSubmit?: (groupData: { name: string; description: string; password: string; handle: string; betakey: string }) => void;
}

export default function MovieNightGroupForm({ onSubmit }: MovieNightGroupFormProps) {
  const setMovieNightGroup = useStore(state => state.setMovieNightGroup);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [betakey, setBetakey] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isValidatingBetaKey, setIsValidatingBetaKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [betaKeyStatus, setBetaKeyStatus] = useState<{
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

  const isFormValid = () => {
    return (
      name.trim() !== '' &&
      description.trim() !== '' &&
      password.trim() !== '' &&
      betakey.trim() !== '' &&
      !errors.betakey
    );
  };

  const validateForm = async () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (!handle.trim()) newErrors.handle = 'Handle is required';

    setErrors(newErrors);
    
    // Validate beta key
    const isBetaKeyValid = await validateBetaKeyInput(betakey);
    
    return Object.keys(newErrors).length === 0 && isBetaKeyValid;
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
        // Validate beta key one final time before submission
        const betaKeyResult = await validateBetaKey(betakey);
        if (!betaKeyResult.isValid || betaKeyResult.inUse) {
          setBetaKeyStatus({
            isValid: false,
            message: betaKeyResult.inUse ? 'Beta key is already in use' : 'Invalid beta key'
          });
          return;
        }

        // Create the movie night group
        const groupData = { name, description, password, handle, betakey };
        const newGroup = await createMovieNightGroup(groupData);
        
        // Update the store with the new group data
        setMovieNightGroup(newGroup);
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to create movie night group'
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

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg relative">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Creating your movie night group...</p>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 italic">
            Create a movie night group to get started.
          </p>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Movie Night Group</h2>
        <form onSubmit={handleSubmit} className="w-full space-y-6">
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
            <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-1">
              Group Handle
            </label>
            <input
              id="handle"
              name="handle"
              type="text"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.handle ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter group handle"
              disabled={isSubmitting}
            />
            {errors.handle && <p className="mt-1 text-sm text-red-600">{errors.handle}</p>}
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
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Describe your movie night group"
              rows={3}
              disabled={isSubmitting}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Group Password
            </label>
            <input
              id="password"
              name="password"
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Create a password for group access"
              disabled={isSubmitting}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            <p className="mt-1 text-sm text-gray-500">Share this password with your movie night group members</p>
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
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
            {errors.submit && (
              <p className="mt-2 text-sm text-red-600 text-center">{errors.submit}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}