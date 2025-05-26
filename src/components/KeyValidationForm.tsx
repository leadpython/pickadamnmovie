'use client';

import { useState } from 'react';

interface KeyValidationFormProps {
  onSubmit?: (key: string) => Promise<void>;
  error?: string;
}

export default function KeyValidationForm({ onSubmit, error }: KeyValidationFormProps) {
  const [key, setKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(key);
      } finally {
        setIsSubmitting(false);
      }
    }
    // Clear the key field after submission
    setKey('');
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
      <div className="flex flex-col items-center">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">
            This app is currently in limited beta testing.
          </p>
          <p className="text-sm text-gray-600">
            Access is restricted to users with valid beta keys.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div>
            <label htmlFor="key" className="sr-only">
              Beta Key
            </label>
            <input
              id="key"
              name="key"
              type="password"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your beta key"
              disabled={isSubmitting}
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Validating...' : 'Validate Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 