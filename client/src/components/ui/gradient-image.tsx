/**
 * Gradient Image Component
 * 
 * A component that shows beautiful, dynamic SVG gradients for frameworks and modules
 * Fallbacks to SVG generation if an image URL is not provided
 */

import React from 'react';
import { generateFrameworkGradient, generateModuleGradient } from '@shared/utils/svg-gradient-generator';

interface GradientImageProps {
  imageUrl?: string;
  frameworkId: number;
  name: string;
  subtitle?: string;
  isModule?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  alt?: string;
}

export const GradientImage: React.FC<GradientImageProps> = ({
  imageUrl,
  frameworkId,
  name,
  subtitle = '',
  isModule = false,
  width = '100%',
  height = 'auto',
  className = '',
  alt = 'Framework Pro image',
}) => {
  // If image URL is provided and doesn't start with 'data:', use it directly
  if (imageUrl && !imageUrl.startsWith('data:')) {
    return (
      <img 
        src={imageUrl} 
        alt={alt}
        width={width}
        height={height}
        className={`object-cover rounded-lg ${className}`}
      />
    );
  }

  // Generate SVG gradient
  const gradientUrl = isModule 
    ? generateModuleGradient(frameworkId, name, subtitle || 'Framework Pro')
    : generateFrameworkGradient(frameworkId, name, subtitle);

  return (
    <img 
      src={gradientUrl} 
      alt={alt}
      width={width}
      height={height}
      className={`object-cover rounded-lg ${className}`}
    />
  );
};

export default GradientImage;