'use client';

import { useState } from 'react';
import SignIn from '@/components/SignIn';
import SignUp from '@/components/SignUp';

export default function Home() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <main className="min-h-screen bg-gray-50">
      {isSignIn ? <SignIn /> : <SignUp />}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center">
        <button
          onClick={() => setIsSignIn(!isSignIn)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
