'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <div className={className}>
      <Image
        src="/pickadamnmovie.png"
        alt="PickADamnMovie Logo"
        width={100}
        height={100}
        className="w-auto h-auto"
        priority
      />
    </div>
  );
} 