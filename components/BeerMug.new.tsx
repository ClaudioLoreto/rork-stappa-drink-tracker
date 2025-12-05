/**
 * BeerMug Component - Professional 3D Beer Mug with Realistic Animations
 * 
 * Features:
 * - Realistic mug shape based on reference images
 * - Progressive oscillation (faster as it fills)
 * - Red measurement ticks
 * - Beer overflow animation on last level
 * - Bubbles and foam effects
 * - Clean, scalable, configurable code
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing, Platform } from 'react-native';
import Svg, { 
  Path, 
  Defs, 
  LinearGradient, 
  Stop, 
  Circle, 
  Line, 
  G,
  Ellipse,
  ClipPath,
  Rect
} from 'react-native-svg';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface BeerMugProps {
  currentLevel: number;      // Current number of drinks validated
  maxLevel: number;          // Total drinks needed (typically 10)
  size?: number;             // Base size of the component
  soundEnabled?: boolean;    // Enable/disable sound effects
  onLevelComplete?: () => void;
  testID?: string;
}

interface MugConfig {
  // SVG Dimensions
  viewBox: {
    width: number;
    height: number;
  };
  
  // Mug Shape Parameters
  mug: {
    topWidth: number;
    bottomWidth: number;
    height: number;
    baseHeight: number;
    wallThickness: number;
  };
  
  // Handle Parameters
  handle: {
    width: number;
    thickness: number;
  };
  
  // Animation Parameters
  animation: {
    swayMin: number;        // Minimum sway angle
    swayMax: number;        // Maximum sway angle
    swayDurationMin: number; // Fastest sway (ms)
    swayDurationMax: number; // Slowest sway (ms)
  };
  
  // Colors
  colors: {
    glass: string;
    glassStroke: string;
    beer: string[];
    foam: string[];
    handle: string;
    handleStroke: string;
    tick: string;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const MUG_CONFIG: MugConfig = {
  viewBox: {
    width: 300,
    height: 400,
  },
  
  mug: {
    topWidth: 110,
    bottomWidth: 90,
    height: 280,
    baseHeight: 20,
    wallThickness: 6,
  },
  
  handle: {
    width: 45,
    thickness: 14,
  },
  
  animation: {
    swayMin: 1.5,
    swayMax: 10,
    swayDurationMin: 1000,
    swayDurationMax: 2500,
  },
  
  colors: {
    glass: 'rgba(200, 220, 235, 0.2)',
    glassStroke: '#8B7355',
    beer: ['#FFB300', '#FF8F00', '#FF6F00'],
    foam: ['#FFFFFF', '#FFF8E1', '#F5F5F5'],
    handle: '#B0BEC5',
    handleStroke: '#78909C',
    tick: '#C62828',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BeerMug: React.FC<BeerMugProps> = ({
  currentLevel,
  maxLevel,
  size = 300,
  soundEnabled = true,
  onLevelComplete,
  testID,
}) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================
  
  const [prevLevel, setPrevLevel] = useState(currentLevel);
  
  // Animation values
  const fillAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnims = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0))
  ).current;
  const overflowAnim = useRef(new Animated.Value(0)).current;
  const foamBubbleAnims = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;

  // ============================================================================
  // CALCULATIONS
  // ============================================================================
  
  const fillPercentage = Math.min(currentLevel / maxLevel, 1.1);
  const isOverflowing = currentLevel >= maxLevel;
  const isNearFull = fillPercentage >= 0.85;
  
  // Calculate sway based on fill level
  const swayAngle = MUG_CONFIG.animation.swayMin + 
    (fillPercentage * (MUG_CONFIG.animation.swayMax - MUG_CONFIG.animation.swayMin));
  
  const swayDuration = MUG_CONFIG.animation.swayDurationMax - 
    (fillPercentage * (MUG_CONFIG.animation.swayDurationMax - MUG_CONFIG.animation.swayDurationMin));

  // ============================================================================
  // SVG PATH GENERATORS
  // ============================================================================
  
  const generateMugOutline = (): string => {
    const { topWidth, bottomWidth, height } = MUG_CONFIG.mug;
    const startX = (MUG_CONFIG.viewBox.width - topWidth) / 2;
    const bottomX = (MUG_CONFIG.viewBox.width - bottomWidth) / 2;
    const topY = 60;
    
    return `
      M ${startX} ${topY}
      L ${bottomX} ${topY + height}
      Q ${bottomX + bottomWidth / 2} ${topY + height + 15}
        ${bottomX + bottomWidth} ${topY + height}
      L ${startX + topWidth} ${topY}
    `;
  };
  
  const generateBeerFill = (percentage: number): string => {
    const { topWidth, bottomWidth, height } = MUG_CONFIG.mug;
    const startX = (MUG_CONFIG.viewBox.width - topWidth) / 2;
    const bottomX = (MUG_CONFIG.viewBox.width - bottomWidth) / 2;
    const topY = 60;
    
    // Calculate beer level
    const beerHeight = height * Math.min(percentage, 1);
    const beerTopY = topY + height - beerHeight;
    
    // Width at beer surface (interpolate between bottom and top)
    const widthAtSurface = bottomWidth + 
      ((topWidth - bottomWidth) * (beerHeight / height));
    const surfaceX = (MUG_CONFIG.viewBox.width - widthAtSurface) / 2;
    
    // Create wave effect for beer surface
    const waveAmplitude = 3;
    const surfacePath = `
      M ${surfaceX} ${beerTopY}
      Q ${surfaceX + widthAtSurface * 0.25} ${beerTopY - waveAmplitude}
        ${surfaceX + widthAtSurface * 0.5} ${beerTopY}
      Q ${surfaceX + widthAtSurface * 0.75} ${beerTopY + waveAmplitude}
        ${surfaceX + widthAtSurface} ${beerTopY}
    `;
    
    return `
      ${surfacePath}
      L ${bottomX + bottomWidth} ${topY + height}
      Q ${bottomX + bottomWidth / 2} ${topY + height + 15}
        ${bottomX} ${topY + height}
      L ${surfaceX} ${beerTopY}
      Z
    `;
  };
  
  const generateHandle = (): string => {
    const { topWidth } = MUG_CONFIG.mug;
    const { width } = MUG_CONFIG.handle;
    const startX = (MUG_CONFIG.viewBox.width + topWidth) / 2;
    const handleStartY = 120;
    const handleHeight = 140;
    
    return `
      M ${startX} ${handleStartY}
      Q ${startX + width} ${handleStartY + 10}
        ${startX + width} ${handleStartY + handleHeight / 2}
      Q ${startX + width} ${handleStartY + handleHeight - 10}
        ${startX} ${handleStartY + handleHeight}
    `;
  };

  // ============================================================================
  // ANIMATIONS
  // ============================================================================
  
  // Fill animation
  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: fillPercentage,
      tension: 15,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [fillPercentage]);
  
  // Sway animation
  useEffect(() => {
    const swaySequence = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: swayDuration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: -1,
          duration: swayDuration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    
    swaySequence.start();
    return () => swaySequence.stop();
  }, [swayDuration]);
  
  // Bubble animations
  useEffect(() => {
    if (fillPercentage > 0.05) {
      const sequences = bubbleAnims.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 300),
            Animated.timing(anim, {
              toValue: 1,
              duration: 3000 + (index % 4) * 500,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        )
      );
      
      sequences.forEach(seq => seq.start());
      return () => sequences.forEach(seq => seq.stop());
    }
  }, [fillPercentage]);
  
  // Overflow animation
  useEffect(() => {
    if (isOverflowing) {
      const overflowSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(overflowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(overflowAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ])
      );
      
      overflowSequence.start();
      return () => overflowSequence.stop();
    }
  }, [isOverflowing]);
  
  // Foam bubble animations
  useEffect(() => {
    if (isNearFull || isOverflowing) {
      const sequences = foamBubbleAnims.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      );
      
      sequences.forEach(seq => seq.start());
      return () => sequences.forEach(seq => seq.stop());
    }
  }, [isNearFull, isOverflowing]);

  // ============================================================================
  // LEVEL CHANGE EFFECTS
  // ============================================================================
  
  useEffect(() => {
    if (currentLevel > prevLevel) {
      // Sound and callback logic here
      if (currentLevel === maxLevel && onLevelComplete) {
        setTimeout(() => onLevelComplete(), 500);
      }
    }
    setPrevLevel(currentLevel);
  }, [currentLevel, prevLevel, maxLevel, onLevelComplete]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const renderMeasurementTicks = () => {
    const ticks = [];
    const { height, topWidth, bottomWidth } = MUG_CONFIG.mug;
    const topY = 60;
    const tickCount = maxLevel;
    
    for (let i = 1; i <= tickCount; i++) {
      const tickPercentage = i / maxLevel;
      const tickY = topY + height - (height * tickPercentage);
      
      // Calculate width at this height
      const widthAtTick = bottomWidth + 
        ((topWidth - bottomWidth) * tickPercentage);
      const tickX = (MUG_CONFIG.viewBox.width - widthAtTick) / 2;
      
      ticks.push(
        <Line
          key={`tick-${i}`}
          x1={tickX + 8}
          y1={tickY}
          x2={tickX + 28}
          y2={tickY}
          stroke={MUG_CONFIG.colors.tick}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      );
    }
    
    return ticks;
  };
  
  const renderBubbles = () => {
    if (fillPercentage <= 0.05) return null;
    
    const { height, bottomWidth } = MUG_CONFIG.mug;
    const topY = 60;
    const beerHeight = height * Math.min(fillPercentage, 1);
    const bottomX = (MUG_CONFIG.viewBox.width - bottomWidth) / 2;
    
    return bubbleAnims.map((anim, index) => {
      const AnimatedCircle = Animated.createAnimatedComponent(Circle);
      const startX = bottomX + 20 + (index % 5) * 12;
      const startY = topY + height - 10;
      const endY = topY + height - beerHeight + 30;
      
      return (
        <AnimatedCircle
          key={`bubble-${index}`}
          cx={startX + Math.sin(index * 2) * 8}
          cy={anim.interpolate({
            inputRange: [0, 1],
            outputRange: [startY, endY],
          })}
          r={anim.interpolate({
            inputRange: [0, 0.2, 0.8, 1],
            outputRange: [1.5, 3.5, 3, 2],
          })}
          fill="#FFE0B2"
          opacity={anim.interpolate({
            inputRange: [0, 0.1, 0.8, 1],
            outputRange: [0, 0.7, 0.5, 0],
          })}
        />
      );
    });
  };
  
  const renderFoam = () => {
    if (!isNearFull && !isOverflowing) return null;
    
    const { height, topWidth, bottomWidth } = MUG_CONFIG.mug;
    const topY = 60;
    const beerHeight = height * Math.min(fillPercentage, 1);
    const beerTopY = topY + height - beerHeight;
    const widthAtSurface = bottomWidth + 
      ((topWidth - bottomWidth) * (beerHeight / height));
    const centerX = MUG_CONFIG.viewBox.width / 2;
    
    return (
      <G>
        {/* Main foam layer */}
        <Ellipse
          cx={centerX}
          cy={beerTopY - 5}
          rx={widthAtSurface / 2 - 8}
          ry={18}
          fill="url(#foamGradient)"
        />
        
        {/* Foam bubbles */}
        {foamBubbleAnims.map((anim, index) => {
          const AnimatedCircle = Animated.createAnimatedComponent(Circle);
          const angle = (index / foamBubbleAnims.length) * Math.PI * 2;
          const radius = 25;
          
          return (
            <AnimatedCircle
              key={`foam-bubble-${index}`}
              cx={centerX + Math.cos(angle) * radius}
              cy={beerTopY - 10 + Math.sin(angle) * 8}
              r={anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [6, 9, 6],
              })}
              fill="#FFFFFF"
              opacity={0.9}
            />
          );
        })}
        
        {/* Overflow foam */}
        {isOverflowing && (
          <>
            <Circle cx={centerX - 40} cy={beerTopY + 5} r={12} fill="#FFF8E1" opacity={0.8} />
            <Circle cx={centerX + 40} cy={beerTopY + 5} r={10} fill="#FFF8E1" opacity={0.8} />
            <Circle cx={centerX - 20} cy={beerTopY - 18} r={14} fill="#FFFFFF" />
            <Circle cx={centerX + 20} cy={beerTopY - 18} r={14} fill="#FFFFFF" />
          </>
        )}
      </G>
    );
  };
  
  const renderOverflowDrips = () => {
    if (!isOverflowing) return null;
    
    const { topWidth } = MUG_CONFIG.mug;
    const startX = (MUG_CONFIG.viewBox.width - topWidth) / 2;
    const AnimatedPath = Animated.createAnimatedComponent(Path);
    
    return (
      <G>
        {[0, 1, 2].map((i) => (
          <AnimatedPath
            key={`drip-${i}`}
            d={`M ${startX + 30 + i * 25} 60 
                Q ${startX + 32 + i * 25} ${90 + i * 15} 
                  ${startX + 30 + i * 25} ${120 + i * 20}`}
            fill="none"
            stroke="url(#beerGradient)"
            strokeWidth="7"
            strokeLinecap="round"
            opacity={overflowAnim.interpolate({
              inputRange: [0, 0.3, 0.7, 1],
              outputRange: [0, 1, 0.5, 0],
            })}
          />
        ))}
      </G>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  const swayRotation = swayAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [`-${swayAngle}deg`, `${swayAngle}deg`],
  });
  
  const aspectRatio = MUG_CONFIG.viewBox.height / MUG_CONFIG.viewBox.width;
  
  return (
    <View 
      style={[styles.container, { width: size, height: size * aspectRatio }]} 
      testID={testID}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          transform: [{ rotate: swayRotation }],
        }}
      >
        <Svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${MUG_CONFIG.viewBox.width} ${MUG_CONFIG.viewBox.height}`}
        >
          <Defs>
            {/* Beer gradient */}
            <LinearGradient id="beerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={MUG_CONFIG.colors.beer[0]} />
              <Stop offset="50%" stopColor={MUG_CONFIG.colors.beer[1]} />
              <Stop offset="100%" stopColor={MUG_CONFIG.colors.beer[2]} />
            </LinearGradient>
            
            {/* Foam gradient */}
            <LinearGradient id="foamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={MUG_CONFIG.colors.foam[0]} />
              <Stop offset="100%" stopColor={MUG_CONFIG.colors.foam[1]} />
            </LinearGradient>
            
            {/* Glass gradient */}
            <LinearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#E3F2FD" stopOpacity="0.3" />
              <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <Stop offset="100%" stopColor="#E3F2FD" stopOpacity="0.3" />
            </LinearGradient>
            
            {/* Handle gradient */}
            <LinearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={MUG_CONFIG.colors.handle} stopOpacity="0.7" />
              <Stop offset="50%" stopColor="#ECEFF1" stopOpacity="0.4" />
              <Stop offset="100%" stopColor={MUG_CONFIG.colors.handle} stopOpacity="0.7" />
            </LinearGradient>
          </Defs>
          
          {/* Overflow drips (behind mug) */}
          {renderOverflowDrips()}
          
          {/* Handle (back layer) */}
          <Path
            d={generateHandle()}
            fill="none"
            stroke="url(#handleGradient)"
            strokeWidth={MUG_CONFIG.handle.thickness}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d={generateHandle()}
            fill="none"
            stroke={MUG_CONFIG.colors.handleStroke}
            strokeWidth={MUG_CONFIG.handle.thickness + 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.3}
          />
          
          {/* Mug body background */}
          <Path
            d={generateMugOutline()}
            fill={MUG_CONFIG.colors.glass}
          />
          
          {/* Beer fill */}
          {fillPercentage > 0 && (
            <Path
              d={generateBeerFill(fillPercentage)}
              fill="url(#beerGradient)"
            />
          )}
          
          {/* Bubbles */}
          {renderBubbles()}
          
          {/* Foam */}
          {renderFoam()}
          
          {/* Glass overlay with gradient */}
          <Path
            d={generateMugOutline()}
            fill="url(#glassGradient)"
          />
          
          {/* Measurement ticks */}
          <G>{renderMeasurementTicks()}</G>
          
          {/* Mug outline */}
          <Path
            d={generateMugOutline()}
            fill="none"
            stroke={MUG_CONFIG.colors.glassStroke}
            strokeWidth={MUG_CONFIG.mug.wallThickness}
            strokeLinejoin="round"
          />
          
          {/* Glass highlights */}
          <Path
            d={`M ${(MUG_CONFIG.viewBox.width - MUG_CONFIG.mug.topWidth) / 2 + 18} 70
                L ${(MUG_CONFIG.viewBox.width - MUG_CONFIG.mug.bottomWidth) / 2 + 16} 320`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            opacity={0.5}
          />
          <Path
            d={`M ${(MUG_CONFIG.viewBox.width + MUG_CONFIG.mug.topWidth) / 2 - 20} 80
                L ${(MUG_CONFIG.viewBox.width + MUG_CONFIG.mug.topWidth) / 2 - 22} 200`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={0.4}
          />
          
          {/* Base rim */}
          <Ellipse
            cx={MUG_CONFIG.viewBox.width / 2}
            cy={355}
            rx={MUG_CONFIG.mug.bottomWidth / 2}
            ry={8}
            fill="none"
            stroke={MUG_CONFIG.colors.glassStroke}
            strokeWidth="4"
            opacity={0.5}
          />
        </Svg>
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
