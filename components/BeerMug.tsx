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
  const markers = Array.from({ length: maxLevel }, (_, i) => {
    const markerLevel = (i + 1) / maxLevel;
    const markerY = beerBottomY - maxBeerHeight * markerLevel;
    
    return (
      <Line
        key={`marker-${i}`}
        x1="62"
        y1={markerY}
        x2="80"
        y2={markerY}
        stroke="#DC2626"
        strokeWidth="3.5"
        strokeLinecap="round"
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
            {/* Beer gradient - golden orange */}
            <LinearGradient id="beerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFD700" stopOpacity="0.95" />
              <Stop offset="30%" stopColor="#FFC000" stopOpacity="0.97" />
              <Stop offset="60%" stopColor="#FFB000" stopOpacity="0.98" />
              <Stop offset="100%" stopColor="#FF9500" stopOpacity="1" />
            </LinearGradient>

            {/* Glass body gradient */}
            <LinearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#D9EEF5" stopOpacity="0.75" />
              <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#D9EEF5" stopOpacity="0.75" />
            </LinearGradient>

            {/* Foam gradient */}
            <LinearGradient id="foamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFEF5" stopOpacity="1" />
              <Stop offset="60%" stopColor="#FFF8E0" stopOpacity="0.98" />
              <Stop offset="100%" stopColor="#FFE4B5" stopOpacity="0.95" />
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
                    strokeWidth="5"
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

          {/* Mug glass body - tapered trapezoid */}
          <Path
            d="M 60 20 L 68 185 Q 100 196 132 185 L 140 20 Z"
            fill="url(#glassGrad)"
            stroke="#A8D5E2"
            strokeWidth="3.5"
          />

          {/* Beer liquid fill */}
          {fillPercentage > 0 && (
            <Path
              d={`M 68 ${beerTopY} L 68 185 Q 100 196 132 185 L 132 ${beerTopY + 3} Q 100 ${beerTopY + 10} 68 ${beerTopY} Z`}
              fill="url(#beerGrad)"
              opacity="0.96"
            />
          )}

          {/* Animated bubbles rising */}
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
                    outputRange: [2, 3.5, 3, 2.5],
                  })}
                  fill="#FFE4B5"
                  opacity={anim.interpolate({
                    inputRange: [0, 0.2, 0.8, 1],
                    outputRange: [0, 0.9, 0.7, 0],
                  })}
                />
              );
            })}

          {/* Foam layer at top (level 9+) */}
          {(isAtLevel9 || isOverflowing) && (
            <G>
              {/* Main foam ellipse */}
              <Ellipse
                cx="100"
                cy={beerTopY - 10}
                rx="40"
                ry="14"
                fill="url(#foamGrad)"
                opacity="0.95"
              />
              
              {/* Foam bubbles on top */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Circle
                  key={`foam-${i}`}
                  cx={70 + i * 12}
                  cy={beerTopY - 14 - Math.sin(i * 1.2) * 4}
                  r={4 + Math.cos(i * 0.8) * 2.5}
                  fill="#FFFACD"
                  opacity="0.92"
                />
              ))}

              {/* Extra overflowing foam at level 10 */}
              {isOverflowing && (
                <>
                  <Ellipse cx="100" cy="13" rx="44" ry="16" fill="url(#foamGrad)" opacity="0.96" />
                  <Circle cx="80" cy="8" r="9" fill="#FFFEF0" opacity="0.95" />
                  <Circle cx="120" cy="8" r="8" fill="#FFFEF0" opacity="0.95" />
                  <Circle cx="100" cy="4" r="7" fill="#FFF8E0" opacity="0.93" />
                  <Circle cx="90" cy="10" r="6" fill="#FFE4B5" opacity="0.9" />
                  <Circle cx="110" cy="10" r="6" fill="#FFE4B5" opacity="0.9" />
                </>
              )}
            </G>
          )}

          {/* Red level markers (tacchette rosse dinamiche) */}
          <G opacity="0.92">{markers}</G>

          {/* Mug handle */}
          <Path
            d="M 140 58 Q 172 63 174 110 Q 172 157 140 162"
            fill="none"
            stroke="#A8D5E2"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Inner handle highlight */}
          <Path
            d="M 142 68 Q 167 72 168 110 Q 167 148 142 152"
            fill="none"
            stroke="#E8F4F8"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* Glass shine/reflection */}
          <Path
            d="M 72 28 Q 78 35 78 90"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.45"
          />
          
          <Path
            d="M 125 35 Q 128 45 128 80"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.35"
          />
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
  const swingAnimation = useRef(new Animated.Value(0)).current;
  const fillAnimation = useRef(new Animated.Value(0)).current;
  const overflowAnimation = useRef(new Animated.Value(0)).current;
  const prevIsFull = useRef<boolean>(false);
  const [bubbleControllers, setBubbleControllers] = useState<Animated.Value[]>([]);

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
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(swingAnimation, {
            toValue: -swingAmount,
            duration: swingDuration,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(swingAnimation, {
            toValue: 0,
            duration: swingDuration / 2,
            useNativeDriver: Platform.OS !== 'web',
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
      playCelebrationSound().catch(() => {});
    }
    prevIsFull.current = isFull;
  }, [isFull]);

  const rotation = swingAnimation.interpolate({
    inputRange: [-15, 15],
    outputRange: ['-15deg', '15deg'],
  });

  useEffect(() => {
    if (progress === 0) {
      setBubbleControllers([]);
      return;
    }
    const count = Math.min(Math.floor(fillPercentage * 10) + 6, 16);
    const ctrls = Array.from({ length: count }, () => new Animated.Value(0));
    setBubbleControllers(ctrls);

    const animations = ctrls.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: 2200 + (i % 5) * 300,
            delay: (i * 150) % 900,
            useNativeDriver: false,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      )
    );

    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [progress, fillPercentage]);

  const renderBubbles = () => {
    if (!bubbleControllers.length) return null;
    return bubbleControllers.map((v, i) => {
      const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [60, -140] });
      const opacity = v.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.8, 0.8, 0] });
      const size = 3 + ((i * 7) % 6);
      const left = 10 + ((i * 37) % 90);
      return (
        <Animated.View
          key={`b-${i}`}
          style={[
            styles.bubble,
            {
              width: size,
              height: size,
              left,
              transform: [{ translateY }],
              opacity,
            },
          ]}
        />
      );
    });
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
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/tkqu7g2thwb8qy91hbgud' }}
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
            <LinearGradient
              colors={["#f5b52a", "#e99b15"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.beerGradient}
            />
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
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
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
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
