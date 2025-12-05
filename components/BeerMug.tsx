/**
 * BeerMug Component - Beer Mug Progress Tracker
 * 
 * Uses the original SVG beer mug design directly.
 * Features:
 * - Original detailed SVG mug (viewBox 0 0 1696 2528)
 * - Animated sway effect based on fill level
 * - Dynamic sizing with preserved aspect ratio
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

// Import the original SVG
import BeerMugSvg from '../assets/images/beer-mug.svg';

// ============================================================================
// TYPES
// ============================================================================

interface BeerMugProps {
  currentLevel: number;
  maxLevel: number;
  size?: number;
  soundEnabled?: boolean;
  onLevelComplete?: () => void;
  testID?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const SVG_WIDTH = 1696;
const SVG_HEIGHT = 2528;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BeerMug: React.FC<BeerMugProps> = ({
  currentLevel,
  maxLevel,
  size = 550,
  soundEnabled = true,
  onLevelComplete,
  testID,
}) => {
  const [prevLevel, setPrevLevel] = useState(currentLevel);
  
  // Animation values
  const swayAnim = useRef(new Animated.Value(0)).current;

  // ============================================================================
  // CALCULATIONS
  // ============================================================================
  
  // Calculate sway parameters based on fill level
  const fillPercentage = maxLevel === 0 ? 0 : Math.min(currentLevel / maxLevel, 1.1);
  const swayAngle = 1.5 + (fillPercentage * 4);
  const swayDuration = 2500 - (fillPercentage * 1000);

  // ============================================================================
  // ANIMATIONS
  // ============================================================================
  
  // Sway animation - smooth continuous
  useEffect(() => {
    swayAnim.setValue(0);
    const swayLoop = Animated.loop(
      Animated.timing(swayAnim, {
        toValue: 1,
        duration: swayDuration * 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    );
    swayLoop.start();
    return () => swayLoop.stop();
  }, [swayDuration]);
  
  // Level complete callback
  useEffect(() => {
    if (currentLevel > prevLevel && currentLevel === maxLevel && onLevelComplete) {
      setTimeout(() => onLevelComplete(), 500);
    }
    setPrevLevel(currentLevel);
  }, [currentLevel, prevLevel, maxLevel, onLevelComplete]);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  const swayRotation = swayAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [`-${swayAngle}deg`, `${swayAngle}deg`, `-${swayAngle}deg`],
  });
  
  // Scaling - maintain aspect ratio
  const aspectRatio = SVG_HEIGHT / SVG_WIDTH;
  const displayHeight = size * aspectRatio;

  return (
    <View 
      style={[styles.container, { width: size, height: displayHeight }]} 
      testID={testID}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          transform: [
            { rotate: swayRotation },
          ],
        }}
      >
        <BeerMugSvg 
          width="100%" 
          height="100%" 
          preserveAspectRatio="xMidYMid meet"
        />
      </Animated.View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BeerMug;
