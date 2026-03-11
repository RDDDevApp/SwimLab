import React, { useState } from 'react';
import { cn } from './ui/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  blurColor?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className, 
  blurColor = "bg-slate-200",
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Parse unsplash URL to generate smaller versions for srcset if possible
  const generateSrcSet = (url: string) => {
    if (!url.includes('images.unsplash.com')) return undefined;
    
    // Simplistic srcset generation for unsplash
    try {
      const baseUrl = new URL(url);
      baseUrl.searchParams.set('q', '80');
      baseUrl.searchParams.set('fm', 'webp'); // use webp
      
      const sizes = [320, 640, 1024, 1920];
      return sizes.map(size => {
        const u = new URL(baseUrl.toString());
        u.searchParams.set('w', size.toString());
        return `${u.toString()} ${size}w`;
      }).join(', ');
    } catch (e) {
      return undefined;
    }
  };

  const srcSet = generateSrcSet(src);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Blurred placeholder */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-500", 
          blurColor,
          isLoaded ? "opacity-0" : "opacity-100 animate-pulse"
        )} 
      />
      
      {/* Actual image */}
      {!hasError ? (
        <img
          src={src}
          srcSet={srcSet}
          alt={alt}
          loading="lazy"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          {...props}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
          Image non trouvée
        </div>
      )}
    </div>
  );
};
