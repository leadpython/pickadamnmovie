'use client';

import { useState } from 'react';

interface MovieNightGroupFormProps {
  onSubmit?: (groupData: { name: string; description: string; password: string; handle: string }) => void;
}

export default function MovieNightGroupForm({ onSubmit }: MovieNightGroupFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateHandle = (value: string) => {
    const handleRegex = /^[a-zA-Z0-9_.]+$/;
    if (!value) return 'Handle is required';
    if (!handleRegex.test(value)) return 'Handle can only contain letters, numbers, underscores, and dots';
    return '';
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    
    const handleError = validateHandle(handle);
    if (handleError) newErrors.handle = handleError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && onSubmit) {
      onSubmit({ name, description, password, handle });
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
      <div className="flex flex-col items-center">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 italic">
            This beta key is not associated with a movie night group. Create one now to get started.
          </p>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Movie Night Group</h2>
        <form onSubmit={handleSubmit} className="w-full space-y-6">
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
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Create a password for group access"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            <p className="mt-1 text-sm text-gray-500">Share this password with your movie night group members</p>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 