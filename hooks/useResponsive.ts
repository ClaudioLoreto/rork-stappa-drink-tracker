import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export type ScreenSize = 'small' | 'medium' | 'large' | 'xlarge';

interface ResponsiveInfo {
  width: number;
  height: number;
  screenSize: ScreenSize;
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  scale: number;
  fontScale: number;
}

/**
 * Custom hook for responsive design
 * Returns screen dimensions and device type information
 */
export const useResponsive = (): ResponsiveInfo => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height, scale, fontScale } = Dimensions.get('window');
    return { width, height, scale, fontScale };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }: { window: ScaledSize }) => {
        setDimensions({
          width: window.width,
          height: window.height,
          scale: window.scale,
          fontScale: window.fontScale,
        });
      }
    );

    return () => subscription?.remove();
  }, []);

  const { width, height, scale, fontScale } = dimensions;

  // Determine screen size
  const getScreenSize = (): ScreenSize => {
    if (width < 375) return 'small'; // iPhone SE, small phones
    if (width < 414) return 'medium'; // iPhone 8, 11 Pro, standard phones
    if (width < 768) return 'large'; // iPhone Plus, Max, large phones
    return 'xlarge'; // Tablets
  };

  const screenSize = getScreenSize();
  const isPortrait = height > width;
  const isLandscape = width > height;

  return {
    width,
    height,
    screenSize,
    isSmallDevice: screenSize === 'small',
    isMediumDevice: screenSize === 'medium',
    isLargeDevice: screenSize === 'large' || screenSize === 'xlarge',
    isPortrait,
    isLandscape,
    scale,
    fontScale,
  };
};

/**
 * Responsive value selector
 * Returns different values based on screen size
 */
export const useResponsiveValue = <T,>(values: {
  small?: T;
  medium?: T;
  large?: T;
  xlarge?: T;
  default: T;
}): T => {
  const { screenSize } = useResponsive();
  
  return values[screenSize] ?? values.default;
};
