import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import Colors from '@/constants/colors';

interface BeerMugProps {
  progress: number;
  ticketsRequired?: number;
  testID?: string;
}

export default function BeerMug({ progress, ticketsRequired = 10, testID }: BeerMugProps) {
  const swingAnimation = useRef(new Animated.Value(0)).current;
  const fillAnimation = useRef(new Animated.Value(0)).current;
  const overflowAnimation = useRef(new Animated.Value(0)).current;

  const fillPercentage = Math.min(progress / ticketsRequired, 1);
  const isFull = progress >= ticketsRequired;

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
            duration: 100,
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

  const rotation = swingAnimation.interpolate({
    inputRange: [-15, 15],
    outputRange: ['-15deg', '15deg'],
  });

  const renderMeasurementLines = () => {
    const lines = [];
    const spacing = 185 / ticketsRequired;
    
    for (let i = 1; i < ticketsRequired; i++) {
      const lineBottom = 30 + (spacing * i);
      const isReached = fillPercentage >= (i / ticketsRequired);
      
      lines.push(
        <View
          key={i}
          style={[
            styles.measurementLine,
            {
              bottom: lineBottom,
              opacity: isReached ? 0.3 : 1,
            },
          ]}
        />
      );
    }
    return lines;
  };

  const renderBubbles = () => {
    if (progress === 0) return null;
    
    const bubbleCount = Math.min(Math.floor(fillPercentage * 8) + 3, 12);
    const bubbles = [];
    
    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push(
        <Animated.View
          key={i}
          style={[
            styles.bubble,
            {
              width: 3 + Math.random() * 5,
              height: 3 + Math.random() * 5,
              left: 10 + Math.random() * 94,
              bottom: Math.random() * 100 + '%',
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
    outputRange: [0, 10, 40],
  });

  const overflowOpacity = overflowAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1, 0],
  });

  const overflowTranslateY = overflowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

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
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/d8vwnjf7y4c3k0elvpj0y' }}
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
            <View style={styles.bubbles}>
              {renderBubbles()}
            </View>
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
        </View>

        {renderMeasurementLines()}

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
    paddingVertical: 20,
  },
  mugContainer: {
    width: 300,
    height: 320,
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
    bottom: 30,
    width: 160,
    height: 230,
    overflow: 'hidden',
    alignItems: 'center',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    borderRadius: 4,
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
    borderRadius: 4,
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
  measurementLine: {
    position: 'absolute',
    left: 85,
    right: 85,
    height: 3,
    backgroundColor: '#8B0000',
    borderRadius: 1.5,
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
