"use client";

import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  fallback?: string;
}

export default function Avatar({ src, alt, size = "md", fallback }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const fallbackUrl = fallback || `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=059669&color=fff&size=128`;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
      {!imageError && src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={handleImageError}
          unoptimized
        />
      ) : (
        <Image
          src={fallbackUrl}
          alt={alt}
          fill
          className="object-cover"
          unoptimized
        />
      )}
    </div>
  );
}
