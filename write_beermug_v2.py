import os

content = r'''import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { MUG_PATHS, LIQUID_PATHS, FOAM_PATHS, NOTCH_PATHS, MUG_VIEWBOX } from './BeerMugPaths';

interface BeerMugProps {
  level?: number;
  currentLevel?: number; // Alias for level
  maxLevel?: number;
  size?: number; // Width of the mug
  soundEnabled?: boolean;
  onLevelComplete?: () => void;
}

const VIEWBOX_WIDTH = 1696;
const VIEWBOX_HEIGHT = 2528;
const ASPECT_RATIO = VIEWBOX_WIDTH / VIEWBOX_HEIGHT;

export default function BeerMug({ 
  level, 
  currentLevel, 
  maxLevel = 10, 
  size = 300,
  soundEnabled,
  onLevelComplete
}: BeerMugProps) {
  const actualLevel = level ?? currentLevel ?? 0;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const foamAnim = useRef(new Animated.Value(0)).current;

  const height = size / ASPECT_RATIO;

  useEffect(() => {
    // Animate fill level
    const targetFill = Math.min(Math.max(actualLevel / maxLevel, 0), 1);
    
    Animated.timing(fillAnim, {
      toValue: targetFill,
      duration: 1500, // Slower, more dramatic fill
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // Height animation requires JS driver
    }).start(({ finished }) => {
      if (finished && targetFill >= 1 && onLevelComplete) {
        onLevelComplete();
      }
    });

    // Animate foam appearance when full or nearly full
    if (targetFill > 0.8) {
      Animated.timing(foamAnim, {
        toValue: 1,
        duration: 1000,
        delay: 1000, // Wait for liquid to rise a bit
        easing: Easing.bounce,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(foamAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [actualLevel, maxLevel]);

  // Interpolate height percentage
  // We want the liquid to start from the bottom and go up.
  // The liquid paths are drawn in the full viewbox.
  // By masking with a container that grows from bottom, we reveal the liquid.
  const liquidHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '90%'], // Don't go 100% to leave room for foam/glass rim if needed
  });

  return (
    <View style={{ width: size, height: height, position: 'relative' }}>
      
      {/* 1. Background: Mug Glass & Structure */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox={MUG_VIEWBOX}>
          {MUG_PATHS.map((p, i) => (
            <Path key={`mug-${i}`} d={p.d} fill={p.fill} />
          ))}
        </Svg>
      </View>

      {/* 2. Liquid Layer (Masked by Animated View Height) */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: liquidHeight,
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* Inner Container to hold the SVG fixed at the bottom */}
        <View style={{ width: size, height: height, position: 'absolute', bottom: 0 }}>
          <Svg width="100%" height="100%" viewBox={MUG_VIEWBOX}>
            {LIQUID_PATHS.map((p, i) => (
              <Path key={`liquid-${i}`} d={p.d} fill={p.fill} />
            ))}
          </Svg>
        </View>
      </Animated.View>

      {/* 3. Notches (Always visible on top of liquid) */}
      <View style={[StyleSheet.absoluteFill, { zIndex: 2 }]}>
        <Svg width="100%" height="100%" viewBox={MUG_VIEWBOX}>
          {NOTCH_PATHS.map((p, i) => (
            <Path key={`notch-${i}`} d={p.d} fill={p.fill} />
          ))}
        </Svg>
      </View>

      {/* 4. Foam (Animated Opacity/Scale) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            zIndex: 3,
            opacity: foamAnim,
            transform: [
              {
                scale: foamAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Svg width="100%" height="100%" viewBox={MUG_VIEWBOX}>
          {FOAM_PATHS.map((p, i) => (
            <Path key={`foam-${i}`} d={p.d} fill={p.fill} />
          ))}
        </Svg>
      </Animated.View>

    </View>
  );
}
'''

with open('components/BeerMug.tsx', 'w') as f:
    f.write(content)
