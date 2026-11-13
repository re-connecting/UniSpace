import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface SpaceImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

export function SpaceImage({ src, alt, title, className = '' }: SpaceImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#007AFF]/10 via-sky-200/20 to-teal-200/20 text-[#007AFF] p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="w-8 h-8 mb-2 opacity-70" aria-hidden="true" />
        {title && <span className="text-xs font-medium opacity-85">{title}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover w-full h-full ${className}`}
    />
  );
}
