'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function IntroAnimation() {
  const [isVisible, setIsVisible] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Show message after logo appears
    const messageTimer = setTimeout(() => {
      setShowMessage(true);
    }, 500);

    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => {
      clearTimeout(messageTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-white z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="transform transition-all duration-500 scale-100">
        <Image
          src="/pickadamnmovie.png"
          alt="Pick a Damn Movie"
          width={200}
          height={200}
          className="object-contain"
          priority
        />
      </div>
      <p
        className={`mt-6 text-xl font-medium text-gray-900 transition-all duration-500 transform ${
          showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        Finally, somebody picks a damn movie.
      </p>
    </div>
  );
} 