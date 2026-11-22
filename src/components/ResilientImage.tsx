import { useState } from 'react';
import { Layers } from 'lucide-react';
import { publicAssetUrl } from '../utils';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full min-h-[220px] bg-gradient-to-br from-[#2B2018] via-[#1E1712] to-[#140F0C] flex flex-col items-center justify-center p-6 text-center border border-[#3E2F23]"
      >
        <Layers className="w-7 h-7 text-[#B47E38] mb-3" aria-hidden="true" />
        <p className="font-display text-lg text-[#F7F5F0] font-medium">
          {fallbackTitle || alt}
        </p>
        <p className="text-xs text-[#C6BDB2] mt-1">Nava Woodworks &amp; Designs</p>
      </div>
    );
  }

  return (
    <img
      src={publicAssetUrl(src)}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
