'use client';

import { useState } from 'react';
import Logo from './Logo';

interface PlanMovieNightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    date: string;
    description: string;
  }) => void;
  movieNightGroupId: string;
}

export default function PlanMovieNightModal({ isOpen, onClose, onSubmit, movieNightGroupId }: PlanMovieNightModalProps) {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    if (!description) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert the date to ISO string to preserve timezone
    const dateWithTime = new Date(date);
    const isoDate = dateWithTime.toISOString();

    onSubmit({ date: isoDate, description });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <Logo className="mb-2" />
            <h2 className="text-2xl font-bold text-gray-900">Plan New Movie Night</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date and Time
            </label>
            <input
              id="date"
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Add details about the movie night..."
              rows={3}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Plan Movie Night
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 