/**
 * BeerMug Component - Animated Beer Mug Progress Tracker
 * 
 * Features:
 * - Fully dynamic SVG rendering (no external SVG dependency)
 * - Animated liquid fill that rises smoothly with gradient
 * - Multiple bubble layers (large, medium, small, sparkle)
 * - Lighter liquid effect at penultimate level
 * - Rich foam with multiple layers at final level
 * - Dynamic tick marks based on promo requirements (maxLevel)
 * - Mug glass outline with handle, shine effects, and base
 * - Sway/oscillation animation for realistic feel
 * 
 * Colors from original SVG:
 * - Liquid: #E6902A, #D47304, #EA9607, #F5C335 (orange/amber)
 * - Foam: #F7EFC1, #F7F2CC, #FFFFFF (beige/cream/white)
 * - Ticks: #951D08 (red)
 * - Glass: #8B7355, #A0926B, #C4B896 (brown tones)
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import Svg, { 
  Path, 
  Defs, 
  LinearGradient, 
  Stop, 
  G, 
  ClipPath, 
  Rect, 
  Ellipse,
  Circle 
} from 'react-native-svg';

// Animated components
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedG = Animated.createAnimatedComponent(G);

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
// CONFIGURATION - Based on original SVG viewBox: 0 0 1696 2528
// ============================================================================

const SVG_WIDTH = 1696;
const SVG_HEIGHT = 2528;

// Liquid area bounds (inside the mug glass) - Updated from annotated SVG
const LIQUID_LEFT = 390;      // Left edge of liquid area
const LIQUID_RIGHT = 980;     // Right edge of liquid area
const LIQUID_WIDTH = LIQUID_RIGHT - LIQUID_LEFT;

// Y positions for liquid levels - Based on annotated SVG analysis
const LIQUID_BOTTOM = 2050;    // Bottom of mug interior (above base)
const LIQUID_TOP_RIM = 620;    // Top rim of mug (where foam starts)
const LIQUID_OVERFLOW = 450;   // Overflow with foam

// Tick Y positions from annotated SVG (TACCHETTE_ROSSE sections)
// Sorted from bottom to top (higher Y = lower position in SVG)
const ORIGINAL_TICK_POSITIONS = [
  1924,  // TACCHETTE_3 - Bottom tick
  1800,  // TACCHETTE_2
  1664,  // TACCHETTE_4
  1531,  // TACCHETTE_7
  1402,  // TACCHETTE_8
  1277,  // TACCHETTE_6
  1184,  // TACCHETTE_5
  1044,  // TACCHETTE_1 - Top tick
];

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
  const [displayLevel, setDisplayLevel] = useState(0);
  const [prevLevel, setPrevLevel] = useState(currentLevel);
  
  // Animation values
  const fillAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const foamAnim = useRef(new Animated.Value(0)).current;

  // ============================================================================
  // CALCULATIONS
  // ============================================================================
  
  const isPenultimate = currentLevel === maxLevel - 1;
  const isComplete = currentLevel >= maxLevel;
  
  // Calculate fill percentage (0 to 1, can exceed 1 for overflow)
  const fillPercentage = maxLevel === 0 ? 0 : Math.min(currentLevel / maxLevel, 1.15);
  
  // Calculate Y position of liquid surface
  const getLiquidY = (level: number): number => {
    if (level <= 0) return LIQUID_BOTTOM;
    if (level >= maxLevel) return LIQUID_OVERFLOW;
    
    const progress = level / maxLevel;
    // Non-linear fill - slower at bottom, faster near top
    const easedProgress = Math.pow(progress, 0.85);
    return LIQUID_BOTTOM - (LIQUID_BOTTOM - LIQUID_TOP_RIM) * easedProgress;
  };
  
  const targetLiquidY = getLiquidY(currentLevel);
  const currentLiquidY = getLiquidY(displayLevel);
  
  // Dynamic tick positions based on maxLevel
  // Number of ticks = maxLevel - 2 (first and last levels don't have ticks)
  const numTicks = Math.max(0, maxLevel - 2);
  
  const tickPositions = numTicks > 0 ? Array.from({ length: numTicks }, (_, i) => {
    // Distribute ticks evenly between bottom and top
    const tickProgress = (i + 1) / (numTicks + 1);
    // Interpolate from original positions
    const baseIndex = tickProgress * (ORIGINAL_TICK_POSITIONS.length - 1);
    const lowerIdx = Math.floor(baseIndex);
    const upperIdx = Math.min(lowerIdx + 1, ORIGINAL_TICK_POSITIONS.length - 1);
    const fraction = baseIndex - lowerIdx;
    
    return ORIGINAL_TICK_POSITIONS[lowerIdx] + 
           (ORIGINAL_TICK_POSITIONS[upperIdx] - ORIGINAL_TICK_POSITIONS[lowerIdx]) * fraction;
  }) : [];
  
  // Sway parameters
  const swayAngle = 1 + (fillPercentage * 3);
  const swayDuration = 3000 - (fillPercentage * 1000);

  // ============================================================================
  // ANIMATIONS
  // ============================================================================
  
  // Fill animation - smooth rise
  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: currentLevel,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    
    // Update display level for calculations
    const listener = fillAnim.addListener(({ value }) => {
      setDisplayLevel(value);
    });
    
    return () => fillAnim.removeListener(listener);
  }, [currentLevel]);
  
  // Wave animation - continuous fluid movement
  useEffect(() => {
    const waveLoop = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    waveLoop.start();
    return () => waveLoop.stop();
  }, []);
  
  // Sway animation - mug oscillation
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
  
  // Foam animation - bubbling effect
  useEffect(() => {
    if (isComplete) {
      const foamLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(foamAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(foamAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      foamLoop.start();
      return () => foamLoop.stop();
    }
  }, [isComplete]);
  
  // Level complete callback
  useEffect(() => {
    if (currentLevel > prevLevel && currentLevel === maxLevel && onLevelComplete) {
      setTimeout(() => onLevelComplete(), 800);
    }
    setPrevLevel(currentLevel);
  }, [currentLevel, prevLevel, maxLevel, onLevelComplete]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const swayRotation = swayAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [`-${swayAngle}deg`, `${swayAngle}deg`, `-${swayAngle}deg`],
  });
  
  // Scaling
  const aspectRatio = SVG_HEIGHT / SVG_WIDTH;
  const displayHeight = size * aspectRatio;
  const scale = size / SVG_WIDTH;

  // Wave path for liquid surface
  const waveOffset = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.PI * 2],
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View 
      style={[styles.container, { width: size, height: displayHeight }]} 
      testID={testID}
    >
      <Animated.View
        style={[
          styles.mugContainer,
          { transform: [{ rotate: swayRotation }] }
        ]}
      >
        {/* Liquid Layer - Behind the mug */}
        <View style={styles.liquidLayer}>
          <Svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          >
            <Defs>
              {/* Beer gradient - golden amber */}
              <LinearGradient id="beerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#F5C335" stopOpacity="1" />
                <Stop offset="25%" stopColor="#EA9A26" stopOpacity="1" />
                <Stop offset="50%" stopColor="#E28506" stopOpacity="1" />
                <Stop offset="75%" stopColor="#D47304" stopOpacity="1" />
                <Stop offset="100%" stopColor="#BD7117" stopOpacity="1" />
              </LinearGradient>
              
              {/* Lighter beer for rim effect */}
              <LinearGradient id="beerLightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#F7EABA" stopOpacity="1" />
                <Stop offset="30%" stopColor="#F5C335" stopOpacity="1" />
                <Stop offset="100%" stopColor="#EA9A26" stopOpacity="1" />
              </LinearGradient>
              
              {/* Foam gradient */}
              <LinearGradient id="foamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <Stop offset="40%" stopColor="#F7EFC1" stopOpacity="1" />
                <Stop offset="100%" stopColor="#EDD9A4" stopOpacity="1" />
              </LinearGradient>
              
              {/* Clip path for liquid inside mug - Updated to match SVG interior */}
              <ClipPath id="mugInterior">
                <Path
                  d="M380 620 
                     L360 2020 
                     Q360 2080 450 2100 
                     L920 2100 
                     Q1010 2080 990 2020 
                     L970 620 
                     Q970 580 900 560 
                     L450 560 
                     Q380 580 380 620 Z"
                />
              </ClipPath>
            </Defs>
            
            {/* Main liquid body */}
            {currentLevel > 0 && (
              <G clipPath="url(#mugInterior)">
                {/* Liquid fill */}
                <Rect
                  x={LIQUID_LEFT}
                  y={currentLiquidY}
                  width={LIQUID_WIDTH}
                  height={LIQUID_BOTTOM - currentLiquidY + 200}
                  fill={isPenultimate || isComplete ? "url(#beerLightGradient)" : "url(#beerGradient)"}
                />
                
                {/* Wave effect on surface */}
                <Ellipse
                  cx={(LIQUID_LEFT + LIQUID_RIGHT) / 2}
                  cy={currentLiquidY}
                  rx={LIQUID_WIDTH / 2 + 20}
                  ry={25 + (fillPercentage * 15)}
                  fill={isPenultimate || isComplete ? "#F7EABA" : "#F5C335"}
                  opacity={0.9}
                />
                
                {/* Secondary wave */}
                <Ellipse
                  cx={(LIQUID_LEFT + LIQUID_RIGHT) / 2 - 50}
                  cy={currentLiquidY + 10}
                  rx={LIQUID_WIDTH / 3}
                  ry={15 + (fillPercentage * 10)}
                  fill="#EA9A26"
                  opacity={0.6}
                />
                
                {/* Bubbles in liquid - multiple layers for depth */}
                {/* Large bubbles - slow rise */}
                <Ellipse cx={450} cy={currentLiquidY + 200} rx={14} ry={20} fill="#F5C335" opacity={0.5} />
                <Ellipse cx={650} cy={currentLiquidY + 350} rx={12} ry={18} fill="#F5C335" opacity={0.4} />
                <Ellipse cx={850} cy={currentLiquidY + 250} rx={15} ry={22} fill="#F5C335" opacity={0.45} />
                
                {/* Medium bubbles - medium rise */}
                <Ellipse cx={500} cy={currentLiquidY + 450} rx={9} ry={13} fill="#F5C335" opacity={0.35} />
                <Ellipse cx={720} cy={currentLiquidY + 150} rx={10} ry={15} fill="#F5C335" opacity={0.55} />
                <Ellipse cx={580} cy={currentLiquidY + 520} rx={8} ry={12} fill="#F5C335" opacity={0.4} />
                <Ellipse cx={780} cy={currentLiquidY + 380} rx={11} ry={16} fill="#F5C335" opacity={0.5} />
                
                {/* Small bubbles - fast rise */}
                <Circle cx={420} cy={currentLiquidY + 100} r={6} fill="#FFFFFF" opacity={0.3} />
                <Circle cx={550} cy={currentLiquidY + 180} r={5} fill="#FFFFFF" opacity={0.25} />
                <Circle cx={680} cy={currentLiquidY + 80} r={7} fill="#FFFFFF" opacity={0.35} />
                <Circle cx={800} cy={currentLiquidY + 130} r={4} fill="#FFFFFF" opacity={0.3} />
                <Circle cx={900} cy={currentLiquidY + 220} r={6} fill="#FFFFFF" opacity={0.25} />
                
                {/* Tiny sparkle bubbles near surface */}
                <Circle cx={480} cy={currentLiquidY + 40} r={3} fill="#FFFFFF" opacity={0.6} />
                <Circle cx={620} cy={currentLiquidY + 55} r={4} fill="#FFFFFF" opacity={0.5} />
                <Circle cx={750} cy={currentLiquidY + 35} r={3} fill="#FFFFFF" opacity={0.55} />
                <Circle cx={870} cy={currentLiquidY + 60} r={4} fill="#FFFFFF" opacity={0.5} />
              </G>
            )}
            
            {/* Foam layer - only at complete level */}
            {isComplete && (
              <G clipPath="url(#mugInterior)">
                {/* Base foam layer - cream colored */}
                <Rect
                  x={LIQUID_LEFT - 20}
                  y={LIQUID_OVERFLOW - 50}
                  width={LIQUID_WIDTH + 40}
                  height={180}
                  fill="#F7EFC1"
                />
                
                {/* Main foam bubbles - large */}
                <Ellipse cx={450} cy={LIQUID_OVERFLOW + 60} rx={100} ry={70} fill="url(#foamGradient)" />
                <Ellipse cx={600} cy={LIQUID_OVERFLOW + 30} rx={110} ry={80} fill="url(#foamGradient)" />
                <Ellipse cx={750} cy={LIQUID_OVERFLOW + 50} rx={105} ry={75} fill="url(#foamGradient)" />
                <Ellipse cx={890} cy={LIQUID_OVERFLOW + 70} rx={95} ry={65} fill="url(#foamGradient)" />
                
                {/* Secondary foam layer */}
                <Ellipse cx={520} cy={LIQUID_OVERFLOW} rx={85} ry={55} fill="#F7F2CC" />
                <Ellipse cx={680} cy={LIQUID_OVERFLOW - 10} rx={90} ry={60} fill="#F7F2CC" />
                <Ellipse cx={830} cy={LIQUID_OVERFLOW + 10} rx={80} ry={50} fill="#F7F2CC" />
                
                {/* Top foam highlights - white */}
                <Ellipse cx={480} cy={LIQUID_OVERFLOW - 40} rx={75} ry={50} fill="#FFFFFF" opacity={0.95} />
                <Ellipse cx={650} cy={LIQUID_OVERFLOW - 55} rx={85} ry={55} fill="#FFFFFF" opacity={0.9} />
                <Ellipse cx={820} cy={LIQUID_OVERFLOW - 35} rx={70} ry={45} fill="#FFFFFF" opacity={0.95} />
                
                {/* Small foam bubbles on top */}
                <Circle cx={420} cy={LIQUID_OVERFLOW - 70} r={28} fill="#FFFFFF" opacity={0.95} />
                <Circle cx={550} cy={LIQUID_OVERFLOW - 85} r={35} fill="#FFFFFF" opacity={0.9} />
                <Circle cx={680} cy={LIQUID_OVERFLOW - 75} r={32} fill="#FFFFFF" opacity={0.92} />
                <Circle cx={800} cy={LIQUID_OVERFLOW - 65} r={30} fill="#FFFFFF" opacity={0.95} />
                <Circle cx={920} cy={LIQUID_OVERFLOW - 55} r={25} fill="#FFFFFF" opacity={0.9} />
                
                {/* Tiny foam bubbles for texture */}
                <Circle cx={450} cy={LIQUID_OVERFLOW - 100} r={15} fill="#FFFFFF" opacity={1} />
                <Circle cx={530} cy={LIQUID_OVERFLOW - 110} r={18} fill="#FFFFFF" opacity={0.95} />
                <Circle cx={620} cy={LIQUID_OVERFLOW - 105} r={16} fill="#FFFFFF" opacity={1} />
                <Circle cx={720} cy={LIQUID_OVERFLOW - 95} r={14} fill="#FFFFFF" opacity={0.95} />
                <Circle cx={800} cy={LIQUID_OVERFLOW - 88} r={12} fill="#FFFFFF" opacity={1} />
                <Circle cx={870} cy={LIQUID_OVERFLOW - 80} r={10} fill="#FFFFFF" opacity={0.95} />
              </G>
            )}
            
            {/* Dynamic Tick Marks - Positioned inside mug left side */}
            {tickPositions.map((y, index) => {
              // Check if this tick level has been reached
              const tickLevel = index + 1;
              const isReached = currentLevel >= tickLevel;
              
              return (
                <G key={`tick-${index}`}>
                  {/* Main tick line - horizontal bar inside mug */}
                  <Rect
                    x={400}
                    y={y - 15}
                    width={170}
                    height={30}
                    rx={5}
                    fill="#951D08"
                    opacity={isReached ? 1 : 0.5}
                  />
                  {/* Tick highlight/shadow for depth */}
                  <Rect
                    x={405}
                    y={y - 10}
                    width={160}
                    height={20}
                    rx={4}
                    fill={isReached ? "#B52510" : "#751505"}
                    opacity={isReached ? 0.6 : 0.3}
                  />
                </G>
              );
            })}
            
            {/* Mug Glass Outline - Simplified beer mug shape */}
            <G>
              {/* Main glass body */}
              <Path
                d="M380 550 
                   C370 550 360 560 358 580
                   L330 2030
                   C328 2070 340 2100 380 2120
                   L900 2140
                   C940 2130 960 2100 958 2060
                   L985 580
                   C983 560 973 550 960 550
                   Z"
                fill="none"
                stroke="#8B7355"
                strokeWidth={12}
                opacity={0.7}
              />
              
              {/* Glass rim - top */}
              <Ellipse
                cx={670}
                cy={545}
                rx={300}
                ry={35}
                fill="none"
                stroke="#A0926B"
                strokeWidth={8}
                opacity={0.8}
              />
              
              {/* Handle */}
              <Path
                d="M960 700
                   C1050 700 1150 750 1200 850
                   C1280 1000 1300 1200 1280 1400
                   C1260 1550 1200 1650 1100 1700
                   C1020 1740 970 1720 960 1680"
                fill="none"
                stroke="#8B7355"
                strokeWidth={35}
                strokeLinecap="round"
                opacity={0.6}
              />
              
              {/* Handle inner curve */}
              <Path
                d="M980 750
                   C1040 760 1100 800 1140 880
                   C1200 1000 1210 1150 1200 1320
                   C1190 1450 1140 1540 1060 1590
                   C1000 1620 970 1600 965 1560"
                fill="none"
                stroke="#C4B896"
                strokeWidth={15}
                strokeLinecap="round"
                opacity={0.4}
              />
              
              {/* Glass shine/highlight - left side */}
              <Path
                d="M400 600
                   L375 1800
                   C375 1810 380 1815 390 1810
                   L395 650
                   C395 640 400 635 400 600
                   Z"
                fill="#FFFFFF"
                opacity={0.2}
              />
              
              {/* Glass shine/highlight - right side */}
              <Path
                d="M920 650
                   L940 1750
                   C940 1760 935 1765 930 1760
                   L910 700
                   C910 690 915 680 920 650
                   Z"
                fill="#FFFFFF"
                opacity={0.15}
              />
              
              {/* Base/bottom of mug */}
              <Ellipse
                cx={660}
                cy={2130}
                rx={280}
                ry={30}
                fill="none"
                stroke="#6B5B45"
                strokeWidth={10}
                opacity={0.5}
              />
            </G>
          </Svg>
        </View>
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
  mugContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  liquidLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default BeerMug;
