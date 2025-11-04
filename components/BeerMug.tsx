import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import Colors from '@/constants/colors';
import { playValidationCelebration } from '@/utils/sounds';

interface BeerMugProps {
  progress: number;
  ticketsRequired?: number;
  showRedMarks?: boolean;
  testID?: string;
}

export default function BeerMug({ progress, ticketsRequired = 10, showRedMarks = true, testID }: BeerMugProps) {
  const swingAnimation = useRef(new Animated.Value(0)).current;
  const fillAnimation = useRef(new Animated.Value(0)).current;
  const overflowAnimation = useRef(new Animated.Value(0)).current;
  const prevIsFull = useRef<boolean>(false);

  const fillPercentage = Math.min(ticketsRequired > 0 ? progress / ticketsRequired : 0, 1);
  const isFull = progress >= ticketsRequired && ticketsRequired > 0;

  useEffect(() => {
    Animated.spring(fillAnimation, {
      toValue: fillPercentage,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [fillPercentage, fillAnimation]);

  useEffect(() => {
    const swingDuration = Math.max(800 - fillPercentage * 600, 200);
    const swingAmount = 5 + fillPercentage * 10;

    if (progress > 0) {
      const swing = Animated.loop(
        Animated.sequence([
          Animated.timing(swingAnimation, {
            toValue: swingAmount,
            duration: swingDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(swingAnimation, {
            toValue: -swingAmount,
            duration: swingDuration,
            useNativeDriver: true,
          }),
          Animated.timing(swingAnimation, {
            toValue: 0,
            duration: swingDuration / 2,
            useNativeDriver: true,
          }),
        ])
      );
      swing.start();
      return () => swing.stop();
    } else {
      swingAnimation.setValue(0);
    }
  }, [progress, fillPercentage, swingAnimation]);

  useEffect(() => {
    if (isFull) {
      const overflow = Animated.loop(
        Animated.sequence([
          Animated.timing(overflowAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(overflowAnimation, {
            toValue: 0,
            duration: 120,
            useNativeDriver: false,
          }),
        ])
      );
      overflow.start();
      return () => overflow.stop();
    } else {
      overflowAnimation.setValue(0);
    }
  }, [isFull, overflowAnimation]);

  useEffect(() => {
    if (isFull && !prevIsFull.current) {
      playValidationCelebration().catch(() => {});
    }
    prevIsFull.current = isFull;
  }, [isFull]);

  const rotation = swingAnimation.interpolate({
    inputRange: [-15, 15],
    outputRange: ['-15deg', '15deg'],
  });

  const renderBubbles = () => {
    if (progress === 0) return null;

    const bubbleCount = Math.min(Math.floor(fillPercentage * 8) + 3, 12);
    const bubbles: React.ReactNode[] = [];

    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push(
        <Animated.View
          key={i}
          style={[
            styles.bubble,
            {
              width: 3 + Math.random() * 5,
              height: 3 + Math.random() * 5,
              left: 8 + Math.random() * 84,
              bottom: `${Math.random() * 100}%`,
            },
          ]}
        />
      );
    }
    return bubbles;
  };

  const fillHeight = fillAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const foamHeight = fillAnimation.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 12, 42],
  });

  const overflowOpacity = overflowAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1, 0],
  });

  const overflowTranslateY = overflowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  const marksArray = useMemo(() => {
    const count = Math.max(0, ticketsRequired);
    return Array.from({ length: count });
  }, [ticketsRequired]);

  return (
    <View style={styles.container} testID={testID}>
      <Animated.View
        style={[
          styles.mugContainer,
          {
            transform: [{ rotate: rotation }],
          },
        ]}
      >
        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/in3cnrmft03a1jcfqsbp5' }}
          style={styles.mugImage}
          resizeMode="contain"
        />

        <View style={styles.liquidContainer}>
          <Animated.View
            style={[
              styles.fill,
              {
                height: fillHeight,
              },
            ]}
          >
            <View style={styles.beerGradient} />
            <View style={styles.bubbles}>{renderBubbles()}</View>
          </Animated.View>

          {progress > 0 && (
            <Animated.View
              style={[
                styles.foam,
                {
                  height: foamHeight,
                },
              ]}
            >
              <View style={styles.foamBubble} />
              <View style={[styles.foamBubble, { left: 30, top: 5 }]} />
              <View style={[styles.foamBubble, { left: 60, top: 2 }]} />
              <View style={[styles.foamBubble, { left: 80, top: 8 }]} />
            </Animated.View>
          )}

          {showRedMarks && ticketsRequired > 1 && (
            <View pointerEvents="none" style={styles.marksContainer}>
              {marksArray.map((_, idx) => {
                const y = (idx / (ticketsRequired - 1)) * 100;
                return <View key={idx} style={[styles.mark, { bottom: `${y}%` }]} />;
              })}
            </View>
          )}
        </View>

        {isFull && (
          <Animated.View
            style={[
              styles.overflowContainer,
              {
                opacity: overflowOpacity,
                transform: [{ translateY: overflowTranslateY }],
              },
            ]}
          >
            <View style={styles.spillDrop} />
            <View style={[styles.spillDrop, { left: 30 }]} />
            <View style={[styles.spillDrop, { left: 60 }]} />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  mugContainer: {
    width: 200,
    height: 220,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mugImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  liquidContainer: {
    position: 'absolute',
    bottom: 24,
    width: 112,
    height: 156,
    overflow: 'hidden',
    alignItems: 'center',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    borderRadius: 6,
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 50,
  },
  foam: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    overflow: 'hidden',
  },
  foamBubble: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    left: 10,
    top: 0,
  },
  marksContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 0,
    bottom: 0,
  },
  mark: {
    position: 'absolute',
    left: 6,
    width: 22,
    height: 3,
    backgroundColor: '#E11D48',
    borderRadius: 2,
    opacity: 0.9,
  },
  overflowContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  spillDrop: {
    width: 8,
    height: 12,
    backgroundColor: Colors.amber,
    borderRadius: 4,
    opacity: 0.8,
  },
});
