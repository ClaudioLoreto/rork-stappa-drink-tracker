import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';
import Colors from '@/constants/colors';

interface BeerMugProps {
  progress: number;
  testID?: string;
}

export default function BeerMug({ progress, testID }: BeerMugProps) {
  const fillAnimation = useRef(new Animated.Value(0)).current;
  const foamAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fillAnimation, {
        toValue: progress / 10,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }),
      Animated.sequence([
        Animated.timing(foamAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(foamAnimation, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [progress, fillAnimation, foamAnimation]);

  const fillHeight = fillAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '85%'],
  });

  const foamOpacity = foamAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const foamScale = foamAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.mugContainer}>
        <Svg width="200" height="280" viewBox="0 0 200 280">
          <Defs>
            <LinearGradient id="beerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={Colors.yellow} stopOpacity="0.9" />
              <Stop offset="40%" stopColor={Colors.amber} stopOpacity="1" />
              <Stop offset="100%" stopColor={Colors.orange} stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          <Path
            d="M 40 40 L 40 240 Q 40 260 60 260 L 140 260 Q 160 260 160 240 L 160 40 Q 160 20 140 20 L 60 20 Q 40 20 40 40 Z"
            fill="url(#glassGradient)"
            stroke={Colors.text.primary}
            strokeWidth="3"
          />

          <Path
            d="M 160 80 L 180 80 Q 190 80 190 90 L 190 140 Q 190 150 180 150 L 160 150"
            fill="url(#glassGradient)"
            stroke={Colors.text.primary}
            strokeWidth="3"
          />
        </Svg>

        <Animated.View
          style={[
            styles.fill,
            {
              height: fillHeight,
            },
          ]}
        >
          <View style={styles.beerGradient} />
          <View style={styles.bubbles}>
            {progress > 0 && (
              <>
                <View style={[styles.bubble, styles.bubble1]} />
                <View style={[styles.bubble, styles.bubble2]} />
                <View style={[styles.bubble, styles.bubble3]} />
              </>
            )}
          </View>
        </Animated.View>

        {progress > 0 && (
          <Animated.View
            style={[
              styles.foam,
              {
                opacity: foamOpacity,
                transform: Platform.OS === 'web' ? [] : [{ scale: foamScale }],
              },
            ]}
          >
            <Svg width="114" height="30" viewBox="0 0 114 30">
              <Ellipse cx="20" cy="15" rx="18" ry="12" fill="#FFFFFF" opacity="0.95" />
              <Ellipse cx="45" cy="18" rx="22" ry="14" fill="#FFFFFF" opacity="0.95" />
              <Ellipse cx="75" cy="16" rx="20" ry="13" fill="#FFFFFF" opacity="0.95" />
              <Ellipse cx="95" cy="14" rx="16" ry="11" fill="#FFFFFF" opacity="0.95" />
            </Svg>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mugContainer: {
    width: 200,
    height: 280,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fill: {
    position: 'absolute',
    bottom: 30,
    left: 43,
    width: 114,
    borderRadius: 8,
    overflow: 'hidden',
  },
  beerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.amber,
  },
  bubbles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 50,
  },
  bubble1: {
    width: 6,
    height: 6,
    left: 20,
    bottom: 30,
  },
  bubble2: {
    width: 8,
    height: 8,
    left: 60,
    bottom: 50,
  },
  bubble3: {
    width: 5,
    height: 5,
    left: 90,
    bottom: 40,
  },
  foam: {
    position: 'absolute',
    top: 18,
    left: 43,
    width: 114,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
