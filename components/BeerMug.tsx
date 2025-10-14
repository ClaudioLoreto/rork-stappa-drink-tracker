import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Colors from '@/constants/colors';

interface BeerMugProps {
  progress: number;
  testID?: string;
}

export default function BeerMug({ progress, testID }: BeerMugProps) {
  const fillAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fillAnimation, {
      toValue: progress / 10,
      useNativeDriver: false,
      tension: 40,
      friction: 7,
    }).start();
  }, [progress, fillAnimation]);

  const fillHeight = fillAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.mugContainer}>
        <Svg width="200" height="280" viewBox="0 0 200 280">
          <Defs>
            <LinearGradient id="beerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={Colors.yellow} stopOpacity="1" />
              <Stop offset="50%" stopColor={Colors.amber} stopOpacity="1" />
              <Stop offset="100%" stopColor={Colors.orange} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          <Path
            d="M 40 40 L 40 240 Q 40 260 60 260 L 140 260 Q 160 260 160 240 L 160 40 Q 160 20 140 20 L 60 20 Q 40 20 40 40 Z"
            fill="none"
            stroke={Colors.text.primary}
            strokeWidth="3"
          />

          <Path
            d="M 160 80 L 180 80 Q 190 80 190 90 L 190 140 Q 190 150 180 150 L 160 150"
            fill="none"
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
        />

        <View style={styles.foam} />
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
    backgroundColor: Colors.amber,
    borderRadius: 8,
  },
  foam: {
    position: 'absolute',
    top: 18,
    left: 43,
    width: 114,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    opacity: 0.9,
  },
});
