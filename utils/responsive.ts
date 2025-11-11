import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scales a value based on screen width
 */
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scales a value based on screen height
 */
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scales a value moderately - good for fonts
 * Uses a factor between 0 and 1 to limit scaling
 */
export const scaleModerate = (size: number, factor = 0.5): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return size + (scale - 1) * size * factor;
};

/**
 * Scales font size based on screen width
 */
export const scaleFontSize = (size: number): number => {
  return Math.round(PixelRatio.roundToNearestPixel(scaleModerate(size, 0.3)));
};

/**
 * Scales spacing (padding, margin) based on screen width
 */
export const scaleSpacing = (size: number): number => {
  return Math.round(scaleWidth(size));
};

/**
 * Get responsive padding based on screen size
 */
export const getResponsivePadding = () => {
  if (SCREEN_WIDTH < 375) {
    return {
      horizontal: 16,
      vertical: 12,
    };
  } else if (SCREEN_WIDTH < 414) {
    return {
      horizontal: 20,
      vertical: 16,
    };
  } else {
    return {
      horizontal: 24,
      vertical: 20,
    };
  }
};

/**
 * Get responsive font sizes
 */
export const getResponsiveFontSizes = () => {
  const baseScale = SCREEN_WIDTH / BASE_WIDTH;
  
  return {
    xs: Math.round(10 * baseScale),
    sm: Math.round(12 * baseScale),
    base: Math.round(14 * baseScale),
    md: Math.round(16 * baseScale),
    lg: Math.round(18 * baseScale),
    xl: Math.round(20 * baseScale),
    '2xl': Math.round(24 * baseScale),
    '3xl': Math.round(30 * baseScale),
    '4xl': Math.round(36 * baseScale),
    '5xl': Math.round(48 * baseScale),
  };
};

/**
 * Check if device is small (iPhone SE, etc)
 */
export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < 375;
};

/**
 * Check if device is large (iPhone Plus, Max, etc)
 */
export const isLargeDevice = (): boolean => {
  return SCREEN_WIDTH >= 414;
};

/**
 * Get device info
 */
export const getDeviceInfo = () => {
  return {
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    isSmall: isSmallDevice(),
    isLarge: isLargeDevice(),
    aspectRatio: SCREEN_HEIGHT / SCREEN_WIDTH,
  };
};

/**
 * Responsive breakpoints
 */
export const breakpoints = {
  xs: 320,  // Very small devices
  sm: 375,  // Small devices (iPhone SE)
  md: 414,  // Medium devices (iPhone 11 Pro Max)
  lg: 768,  // Large devices (tablets)
  xl: 1024, // Extra large (tablets landscape)
};

/**
 * Check current breakpoint
 */
export const getCurrentBreakpoint = (): keyof typeof breakpoints => {
  if (SCREEN_WIDTH < breakpoints.sm) return 'xs';
  if (SCREEN_WIDTH < breakpoints.md) return 'sm';
  if (SCREEN_WIDTH < breakpoints.lg) return 'md';
  if (SCREEN_WIDTH < breakpoints.xl) return 'lg';
  return 'xl';
};
