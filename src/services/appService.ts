import axios from 'axios';
import { useStore } from '@/store/store';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

interface BetaKeyValidationResponse {
  valid: boolean;
  message?: string;
  groupId?: string;
}

interface MovieNightGroup {
  id: string;
  name: string;
  description: string;
}

// API methods
export const appService = {
  // Beta key validation
  validateBetaKey: async (key: string) => {
    const response = await api.post<BetaKeyValidationResponse>('/beta/validate', { key });
    if (response.data.valid && response.data.groupId) {
      // Store beta key
      useStore.getState().setBetaKey(key);
      
      // Fetch and store group data
      const groupResponse = await api.get<MovieNightGroup>(`/groups/${response.data.groupId}`);
      useStore.getState().setMovieNightGroup(groupResponse.data);
    }
    return response.data;
  },

  // Movie night group
  createMovieNightGroup: async (data: { name: string; description: string; password: string }) => {
    const response = await api.post<MovieNightGroup>('/groups', data);
    useStore.getState().setMovieNightGroup(response.data);
    return response.data;
  },

  getMovieNightGroup: async (groupId: string) => {
    const response = await api.get<MovieNightGroup>(`/groups/${groupId}`);
    return response.data;
  },

  // Movie nights
  createMovieNight: async (groupId: string, data: { date: string; description: string }) => {
    const response = await api.post(`/groups/${groupId}/movie-nights`, data);
    return response.data;
  },

  getMovieNights: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}/movie-nights`);
    return response.data;
  },

  getMovieNight: async (movieNightId: string) => {
    const response = await api.get(`/movie-nights/${movieNightId}`);
    return response.data;
  },
};

export default appService; 