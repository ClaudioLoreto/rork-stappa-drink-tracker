import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing, Platform } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Ellipse, Circle, Line, G } from 'react-native-svg';
import { playStappaSound, playCheerSound, playOverflowSound } from '@/utils/sounds';

interface BeerMugProps {
  currentLevel: number; // Current validated tickets
  maxLevel: number; // Total shots needed (1-10 based on promo)
  size?: number;
  soundEnabled?: boolean;
  onLevelComplete?: () => void;
  testID?: string;
}

const BeerMug: React.FC<BeerMugProps> = ({
  currentLevel,
  maxLevel,
  size = 240,
  soundEnabled = true,
  onLevelComplete,
  testID,
}) => {
  const [prevLevel, setPrevLevel] = useState(currentLevel);
  
  // Animation values
  const fillAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const foamAnim = useRef(new Animated.Value(0)).current;
  const overflowAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  // Calculate fill percentage (0-1.1 with overflow)
  const fillPercentage = Math.min(currentLevel / maxLevel, 1.1);
  const isOverflowing = currentLevel > maxLevel;
  const isAtLevel9 = fillPercentage >= 0.9 && fillPercentage < 1.0;

  // Oscillation intensity increases with fill level
  const swayIntensity = 2 + fillPercentage * 8; // 2-10 degrees

  useEffect(() => {
    // Animate fill level smoothly
    Animated.spring(fillAnim, {
      toValue: fillPercentage,
      tension: 20,
      friction: 7,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // Continuous sway animation (faster when fuller)
    const swaySequence = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 2200 - fillPercentage * 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: 2200 - fillPercentage * 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    swaySequence.start();

    return () => swaySequence.stop();
  }, [fillPercentage]);

  // Foam animation at level 9
  useEffect(() => {
    if (isAtLevel9 || isOverflowing) {
      const foamSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(foamAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(foamAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
      foamSequence.start();

      return () => foamSequence.stop();
    }
  }, [isAtLevel9, isOverflowing]);

  // Overflow dripping animation
  useEffect(() => {
    if (isOverflowing) {
      const overflowSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(overflowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(overflowAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
      overflowSequence.start();

      // Play overflow sound once
      if (soundEnabled) {
        playOverflowSound();
      }

      return () => overflowSequence.stop();
    }
  }, [isOverflowing, soundEnabled]);

  // Bubble animations
  useEffect(() => {
    if (fillPercentage > 0.1) {
      const bubbleSequences = bubbleAnims.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 350),
            Animated.timing(anim, {
              toValue: 1,
              duration: 2800 + (index % 3) * 400,
              easing: Easing.linear,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ])
        )
      );

      bubbleSequences.forEach(seq => seq.start());

      return () => bubbleSequences.forEach(seq => seq.stop());
    }
  }, [fillPercentage]);

  // Sound effects on level increase
  useEffect(() => {
    if (currentLevel > prevLevel && soundEnabled) {
      // Play "stappa" sound
      playStappaSound();
      
      // Play cheer sound when completing a marker level
      const markerInterval = maxLevel >= 5 ? Math.ceil(maxLevel / 10) : 1;
      if (currentLevel % markerInterval === 0 || currentLevel === maxLevel) {
        setTimeout(() => {
          if (soundEnabled) playCheerSound();
        }, 400);
      }

      // Trigger completion callback
      if (currentLevel === maxLevel && onLevelComplete) {
        onLevelComplete();
      }
    }

    setPrevLevel(currentLevel);
  }, [currentLevel, prevLevel, maxLevel, soundEnabled, onLevelComplete]);

  // Calculate beer liquid dimensions
  const maxBeerHeight = 165; // Max height in SVG units
  const beerHeightPx = maxBeerHeight * Math.min(fillPercentage, 1);
  const beerBottomY = 185;
  const beerTopY = beerBottomY - beerHeightPx;

  // Generate red level markers dynamically
  // Logic: maxLevel - 2 ticks. Rim is 9th, Overflow is 10th (if maxLevel is 10)
  const numberOfTicks = Math.max(0, maxLevel - 2);
  
  const markers = Array.from({ length: numberOfTicks }, (_, i) => {
    // Calculate position relative to the liquid height
    // We want ticks distributed evenly up to the "rim" level
    const tickStep = maxBeerHeight / (maxLevel); 
    const markerY = beerBottomY - tickStep * (i + 1);
    
    return (
      <Line
        key={`marker-${i}`}
        x1="62"
        y1={markerY}
        x2="80"
        y2={markerY}
        stroke="#D32F2F"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.8"
      />
    );
  });

  // Sway rotation interpolation
  const swayRotation = swayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`-${swayIntensity}deg`, `${swayIntensity}deg`],
  });

  return (
    <View style={[styles.container, { width: size, height: size * 1.2 }]} testID={testID}>
      <Animated.View
        style={{
          transform: [{ rotate: swayRotation }],
        }}
      >
        <Svg width={size} height={size * 1.2} viewBox="0 0 200 240">
          <Defs>
            {/* Richer Beer Gradient */}
            <LinearGradient id="beerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFC107" stopOpacity="1" />
              <Stop offset="50%" stopColor="#FF9800" stopOpacity="1" />
              <Stop offset="100%" stopColor="#FF6F00" stopOpacity="1" />
            </LinearGradient>

            {/* Glass Gradient - More transparent and glassy */}
            <LinearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#E1F5FE" stopOpacity="0.3" />
              <Stop offset="20%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <Stop offset="50%" stopColor="#E1F5FE" stopOpacity="0.05" />
              <Stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <Stop offset="100%" stopColor="#E1F5FE" stopOpacity="0.3" />
            </LinearGradient>

            {/* Fluffy Foam Gradient */}
            <LinearGradient id="foamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="100%" stopColor="#FFF8E1" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Overflow drips */}
          {isOverflowing && (
            <G>
              {[0, 1, 2].map((i) => {
                const AnimatedPathComp = Animated.createAnimatedComponent(Path);
                return (
                  <AnimatedPathComp
                    key={`drip-${i}`}
                    d={`M ${70 + i * 30} 18 Q ${72 + i * 30} ${45 + i * 8} ${70 + i * 30} 75`}
                    fill="none"
                    stroke="url(#beerGrad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    opacity={overflowAnim.interpolate({
                      inputRange: [0, 0.4, 0.8, 1],
                      outputRange: [0, 1, 0.6, 0],
                    })}
                  />
                );
              })}
            </G>
          )}

          {/* Mug Handle - Back part */}
          <Path
            d="M 140 58 Q 185 63 185 110 Q 185 157 140 162"
            fill="none"
            stroke="#FFB74D"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Handle Outline */}
          <Path
            d="M 140 58 Q 185 63 185 110 Q 185 157 140 162"
            fill="none"
            stroke="#5D4037"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.2"
          />

          {/* Mug Glass Body - Background */}
          <Path
            d="M 60 20 L 68 185 Q 100 200 132 185 L 140 20 Z"
            fill="url(#glassGrad)"
            stroke="#5D4037" 
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Beer Liquid Fill */}
          {fillPercentage > 0 && (
            <Path
              d={`M 68 ${beerTopY} L 68 185 Q 100 200 132 185 L 132 ${beerTopY + 3} Q 100 ${beerTopY + 10} 68 ${beerTopY} Z`}
              fill="url(#beerGrad)"
            />
          )}

          {/* Bubbles */}
          {fillPercentage > 0.1 &&
            bubbleAnims.map((anim, index) => {
              const AnimatedCircleComp = Animated.createAnimatedComponent(Circle);
              const startX = 72 + (index % 4) * 16;
              const startY = beerBottomY - 8;
              const endY = Math.max(beerTopY + 15, 30);

              return (
                <AnimatedCircleComp
                  key={`bubble-${index}`}
                  cx={startX + Math.sin(index * 1.5) * 10}
                  cy={anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [startY, endY],
                  })}
                  r={anim.interpolate({
                    inputRange: [0, 0.3, 0.7, 1],
                    outputRange: [2, 4, 3, 2],
                  })}
                  fill="#FFF3E0"
                  opacity={anim.interpolate({
                    inputRange: [0, 0.2, 0.8, 1],
                    outputRange: [0, 0.8, 0.6, 0],
                  })}
                />
              );
            })}

          {/* Glass Highlights (Reflections) */}
          <Path
            d="M 75 30 Q 80 35 80 170"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.4"
          />
          <Path
            d="M 125 35 Q 128 45 128 100"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Red Level Markers */}
          <G>{markers}</G>

          {/* Mug Glass Body - Outline (Foreground) */}
          <Path
            d="M 60 20 L 68 185 Q 100 200 132 185 L 140 20"
            fill="none"
            stroke="#5D4037" 
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Bottom Base Highlight */}
          <Path
            d="M 70 188 Q 100 198 130 188"
            fill="none"
            stroke="#5D4037"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Foam Layer */}
          {(isAtLevel9 || isOverflowing) && (
            <G>
              {/* Main Foam Body */}
              <Ellipse
                cx="100"
                cy={beerTopY - 8}
                rx="44"
                ry="18"
                fill="url(#foamGrad)"
                stroke="#5D4037"
                strokeWidth="2"
              />
              
              {/* Foam Bubbles Detail */}
              {[0, 1, 2, 3, 4].map((i) => (
                <Circle
                  key={`foam-${i}`}
                  cx={70 + i * 15}
                  cy={beerTopY - 12 - Math.sin(i * 2) * 5}
                  r={6 + Math.cos(i) * 2}
                  fill="#FFFFFF"
                />
              ))}
              
              {/* Overflowing Foam */}
              {isOverflowing && (
                <>
                  <Circle cx="60" cy={beerTopY + 5} r="10" fill="url(#foamGrad)" stroke="#5D4037" strokeWidth="1" />
                  <Circle cx="140" cy={beerTopY + 5} r="12" fill="url(#foamGrad)" stroke="#5D4037" strokeWidth="1" />
                  <Circle cx="80" cy={beerTopY - 15} r="14" fill="url(#foamGrad)" />
                  <Circle cx="120" cy={beerTopY - 15} r="14" fill="url(#foamGrad)" />
                </>
              )}
            </G>
          )}
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BeerMug;

