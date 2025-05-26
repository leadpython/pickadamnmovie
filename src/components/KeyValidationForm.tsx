'use client';

import Image from 'next/image';
import { useState } from 'react';

interface KeyValidationFormProps {
  onSubmit?: (key: string) => void;
}

export default function KeyValidationForm({ onSubmit }: KeyValidationFormProps) {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(key);
    }
    // Clear the key field after submission
    setKey('');
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
      <div className="flex flex-col items-center">
        <Image
          src="/pickadamnmovie.png"
          alt="Pick a Damn Movie Logo"
          width={300}
          height={100}
          priority
          className="mb-8"
        />
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
            />
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Validate Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 