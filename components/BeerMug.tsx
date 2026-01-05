/**
 * BeerMug.tsx - Sistema Mug CORRETTO v4
 * 
 * CORREZIONI:
 * - Usa PHASE_EMPTY per mug vuoto (NO liquido, NO schiuma)
 * - Usa PHASE_FILLING per mug intermedio (liquido che sale)
 * - Usa PHASE_FULL per mug pieno (schiuma overflow)
 * - Animazione oscillazione del liquido (come vero liquido)
 * - Schiuma animata che si muove
 */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';
import { 
  PHASE_EMPTY,
  PHASE_FILLING,
  PHASE_FULL,
  MugPath,
  MugPhase,
} from './BeerMugPaths';

// ============================================================
// CONSTANTS
// ============================================================

// ViewBox diversi per ogni fase (estratti dai file SVG originali)
const VIEWBOX_EMPTY_FILLING = "0 0 832 1248";
const VIEWBOX_FULL = "0 0 1696 2528";

// Dimensioni per ogni viewBox
const VB_SMALL_WIDTH = 832;
const VB_SMALL_HEIGHT = 1248;
const VB_LARGE_WIDTH = 1696;
const VB_LARGE_HEIGHT = 2528;

// Aspect ratio (uguale per entrambi)
const ASPECT_RATIO = VB_SMALL_WIDTH / VB_SMALL_HEIGHT;

// Liquid Y coordinates per viewBox PICCOLO (832x1248) - per fase FILLING
const LIQUID_TOP_Y_SMALL = 340;   // Dove inizia il liquido pieno
const LIQUID_BOTTOM_Y_SMALL = 1000; // Dove inizia il liquido vuoto

// ============================================================
// TYPES
// ============================================================

export interface BeerMugProps {
  currentShots: number;
  maxShots: number;
  size?: number;
  animated?: boolean;
  onComplete?: () => void;
}

// ============================================================
// CONSTANTS - NOTCH GEOMETRY
// ============================================================
// From SVG analysis of 8 notches in viewBox 1696x2528:
// - Y range: 1034.4 (bottom) to 1922.1 (top)
// - Total height occupied: 887.7 units
// - Average gap between notches: 126.8 units
// - Notch width: ~160-170 units
// - Notch height: ~100-120 units

const NOTCH_Y_MIN = 1034.4;           // Lowest notch Y position
const NOTCH_Y_MAX = 1922.1;           // Highest notch Y position
const NOTCH_TOTAL_HEIGHT = NOTCH_Y_MAX - NOTCH_Y_MIN; // 887.7
const NOTCH_AVG_GAP = 126.8;          // Average space between notches
const NOTCH_WIDTH = 165;              // Approximate width
const NOTCH_HEIGHT = 110;             // Approximate height

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Calculates the number of visible notches based on maxShots
 * Formula: maxShots - 2 (last 2 shots are phase transitions)
 */
function getNotchCount(maxShots: number): number {
  return Math.max(0, maxShots - 2);
}

/**
 * Distributes notches evenly between NOTCH_Y_MIN and NOTCH_Y_MAX
 * Returns array of Y positions for each notch
 */
function calculateNotchPositions(notchCount: number): number[] {
  if (notchCount <= 0) return [];
  if (notchCount === 1) {
    // Single notch: place in the middle
    return [(NOTCH_Y_MIN + NOTCH_Y_MAX) / 2];
  }
  
  // Multiple notches: distribute evenly
  const positions: number[] = [];
  const step = NOTCH_TOTAL_HEIGHT / (notchCount - 1);
  
  for (let i = 0; i < notchCount; i++) {
    positions.push(NOTCH_Y_MIN + i * step);
  }
  
  return positions;
}

function getMugPhase(currentShots: number, maxShots: number): 'empty' | 'filling' | 'full' {
  if (currentShots <= 0) return 'empty';
  if (currentShots >= maxShots) return 'full';
  return 'filling';
}

function getLiquidFillPercentage(currentShots: number, maxShots: number): number {
  if (currentShots <= 0) return 0;
  if (currentShots >= maxShots) return 1;
  
  const notchCount = getNotchCount(maxShots);
  if (notchCount === 0) return currentShots / maxShots;
  if (currentShots === maxShots - 1) return 0.95;
  
  const fillPerNotch = 0.85 / notchCount;
  return Math.min(currentShots * fillPerNotch, 0.85);
}

function selectNotchPaths(notchPaths: MugPath[], maxShots: number): MugPath[] {
  const notchCount = getNotchCount(maxShots);
  if (notchCount <= 0 || notchPaths.length === 0) return [];
  
  const step = notchPaths.length / notchCount;
  return Array.from({ length: notchCount }, (_, i) => 
    notchPaths[Math.min(Math.floor(i * step), notchPaths.length - 1)]
  );
}

// ============================================================
// DYNAMIC NOTCH COMPONENT
// ============================================================

/**
 * Generates scaled notch paths for dynamic distribution
 * Takes original notch from SVG and transforms it to new Y position
 */
function scaleNotchToPosition(
  originalNotch: MugPath,
  originalY: number,
  targetY: number
): MugPath {
  const yDelta = targetY - originalY;
  
  // Apply Y transform to the path
  const transformedD = originalNotch.d.replace(
    /([0-9.-]+),([0-9.-]+)/g,
    (match, x, y) => {
      const newY = parseFloat(y) + yDelta;
      return `${x},${newY}`;
    }
  );
  
  return {
    ...originalNotch,
    d: transformedD,
  };
}

const DynamicNotches: React.FC<{
  maxShots: number;
  originalNotches: MugPath[];
  currentShots: number;
}> = React.memo(({ maxShots, originalNotches, currentShots }) => {
  const notchCount = getNotchCount(maxShots);
  
  if (notchCount <= 0 || originalNotches.length < 8) {
    return null;
  }
  
  // Get target positions for notches
  const targetPositions = calculateNotchPositions(notchCount);
  
  // Reference positions from the original 8 notches
  const originalPositions = [1034.4, 1182.6, 1278.5, 1405.5, 1535.5, 1675.2, 1797.4, 1922.1];
  
  // Select which original notches to use based on count
  const selectedIndices = Array.from({ length: notchCount }, (_, i) =>
    Math.floor((i / Math.max(1, notchCount - 1)) * 7)
  );
  
  return (
    <G>
      {targetPositions.map((targetY, i) => {
        const sourceIdx = selectedIndices[i];
        const originalNotch = originalNotches[sourceIdx];
        const originalY = originalPositions[sourceIdx];
        
        if (!originalNotch) return null;
        
        const scaledNotch = scaleNotchToPosition(originalNotch, originalY, targetY);
        
        return (
          <Path
            key={i}
            d={scaledNotch.d}
            fill={scaledNotch.fill}
            opacity={scaledNotch.opacity ?? 1}
          />
        );
      })}
    </G>
  );
});

// ============================================================
// PATH GROUP COMPONENT
// ============================================================

const PathGroup: React.FC<{ paths: MugPath[] }> = React.memo(({ paths }) => (
  <G>
    {paths.map((path, i) => (
      <Path key={i} d={path.d} fill={path.fill} opacity={path.opacity ?? 1} />
    ))}
  </G>
));

// ============================================================
// FILTRO COLORI LIQUIDO (tutti i colori caldi da escludere dal glass)
// ============================================================
// Funzione per verificare se un colore è parte del liquido statico
const isLiquidColor = (hexColor: string): boolean => {
  // Normalizza il colore
  const hex = hexColor.replace('#', '').toUpperCase();
  if (hex.length !== 6) return false;
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // TUTTI i colori caldi (arancione/giallo/marrone/oro)
  // R alto (>180), B basso (<100) = colore caldo
  const isWarmColor = r > 180 && b < 100;
  
  // BIANCHI puri e quasi-bianchi (sfondo) 
  const isWhitish = r > 245 && g > 245 && b > 240;
  
  // CREMA/BEIGE chiari
  const isCream = r > 240 && g > 220 && b > 180 && b < 250;
  
  return isWarmColor || isWhitish || isCream;
};

// Funzione per filtrare i path del vetro escludendo i colori del liquido
const filterGlassPaths = (paths: MugPath[]): MugPath[] => {
  return paths.filter(path => !isLiquidColor(path.fill));
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function BeerMug({
  currentShots,
  maxShots,
  size = 280,
  animated = true,
  onComplete,
}: BeerMugProps) {
  // Animation refs
  const oscillateAnim = useRef(new Animated.Value(0)).current;
  const liquidWaveAnim = useRef(new Animated.Value(0)).current;
  const foamWaveAnim = useRef(new Animated.Value(0)).current;
  const lightFoamAnim = useRef(new Animated.Value(0)).current;  // Schiuma leggera FASE 2
  const liquidYAnim = useRef(new Animated.Value(LIQUID_BOTTOM_Y_SMALL)).current;
  
  // Ref per evitare chiamate multiple di onComplete
  const hasCalledComplete = useRef(false);
  
  // State
  const [clipY, setClipY] = useState(LIQUID_BOTTOM_Y_SMALL);
  const [liquidWaveOffset, setLiquidWaveOffset] = useState(0);
  const [foamWaveOffset, setFoamWaveOffset] = useState(0);
  const [lightFoamOffset, setLightFoamOffset] = useState(0);  // Schiuma leggera FASE 2

  // Calculations
  const height = size / ASPECT_RATIO;
  const phase = getMugPhase(currentShots, maxShots);
  const fillPct = getLiquidFillPercentage(currentShots, maxShots);

  // IMPORTANTE: Seleziona la fase corretta!
  const phaseData: MugPhase = useMemo(() => {
    switch (phase) {
      case 'empty': return PHASE_EMPTY;
      case 'filling': return PHASE_FILLING;
      case 'full': return PHASE_FULL;
    }
  }, [phase]);

  // ViewBox dinamico in base alla fase
  const currentViewBox = phase === 'full' ? VIEWBOX_FULL : VIEWBOX_EMPTY_FILLING;

  // Select notches - SOLO per fase FULL (le tacchette hanno coordinate per viewBox grande)
  const selectedNotches = useMemo(() => {
    // Le tacchette sono solo nella fase FULL (hanno coordinate per viewBox 1696x2528)
    // Non le mostriamo in empty/filling perché usano viewBox diverso (832x1248)
    if (phase !== 'full') return [];
    
    return selectNotchPaths(PHASE_FULL.notch, maxShots);
  }, [maxShots, phase]);

  // ============================================================
  // OSCILLATION ANIMATION (Pendulum)
  // ============================================================
  useEffect(() => {
    if (!animated) return;

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(oscillateAnim, {
          toValue: -1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(oscillateAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(oscillateAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, [animated]);

  // ============================================================
  // LIQUID WAVE ANIMATION (liquido che oscilla dentro il boccale)
  // ============================================================
  useEffect(() => {
    if (!animated || phase === 'empty') return;

    const id = liquidWaveAnim.addListener(({ value }) => setLiquidWaveOffset(value));

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(liquidWaveAnim, {
          toValue: 15,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(liquidWaveAnim, {
          toValue: -15,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(liquidWaveAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );

    anim.start();
    return () => {
      anim.stop();
      liquidWaveAnim.removeListener(id);
    };
  }, [animated, phase]);

  // ============================================================
  // FOAM WAVE ANIMATION (schiuma che si muove)
  // ============================================================
  useEffect(() => {
    if (!animated || phase !== 'full') return;

    const id = foamWaveAnim.addListener(({ value }) => setFoamWaveOffset(value));

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(foamWaveAnim, {
          toValue: 25,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(foamWaveAnim, {
          toValue: -10,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(foamWaveAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );

    anim.start();
    return () => {
      anim.stop();
      foamWaveAnim.removeListener(id);
    };
  }, [animated, phase]);

  // ============================================================
  // LIGHT FOAM ANIMATION (schiuma leggera FASE 2)
  // ============================================================
  useEffect(() => {
    if (!animated || phase !== 'filling') return;

    const id = lightFoamAnim.addListener(({ value }) => setLightFoamOffset(value));

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(lightFoamAnim, {
          toValue: 8,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(lightFoamAnim, {
          toValue: -5,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(lightFoamAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );

    anim.start();
    return () => {
      anim.stop();
      lightFoamAnim.removeListener(id);
    };
  }, [animated, phase]);

  // ============================================================
  // LIQUID FILL ANIMATION (per fase filling)
  // ============================================================
  useEffect(() => {
    if (phase !== 'filling') {
      // Se non in filling, resetta
      if (phase === 'empty') {
        setClipY(LIQUID_BOTTOM_Y_SMALL);
        liquidYAnim.setValue(LIQUID_BOTTOM_Y_SMALL);
      }
      return;
    }

    const targetY = LIQUID_BOTTOM_Y_SMALL - (fillPct * (LIQUID_BOTTOM_Y_SMALL - LIQUID_TOP_Y_SMALL));

    const id = liquidYAnim.addListener(({ value }) => setClipY(value));

    Animated.timing(liquidYAnim, {
      toValue: targetY,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => liquidYAnim.removeListener(id);
  }, [fillPct, phase]);

  // ============================================================
  // ON COMPLETE CALLBACK (chiamato UNA SOLA VOLTA quando diventa full)
  // ============================================================
  useEffect(() => {
    // Se non è più full, resetta il flag per permettere una nuova chiamata
    if (phase !== 'full') {
      hasCalledComplete.current = false;
      return;
    }
    
    // Se è full e onComplete esiste e NON è già stato chiamato
    if (phase === 'full' && onComplete && !hasCalledComplete.current) {
      hasCalledComplete.current = true; // Segna come chiamato PRIMA del timer
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [phase]); // NOTA: NON include onComplete nelle dipendenze per evitare ri-esecuzioni

  // Interpolation for rotation
  const rotate = oscillateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mug, { width: size, height, transform: [{ rotate }] }]}>
        <Svg width="100%" height="100%" viewBox={currentViewBox} preserveAspectRatio="xMidYMid meet">
          
          {/* FASE EMPTY: Solo vetro + TACCHETTE per riconoscimento univoco */}
          {phase === 'empty' && (
            <>
              <PathGroup paths={phaseData.glass} />
              
              {/* TACCHETTE DINAMICHE - Scale from large viewBox to small viewBox coordinate space */}
              {/* Mostrate anche quando vuoto per coerenza visiva e riconoscimento del mug */}
              <G transform="scale(0.49, 0.49) translate(0, 0)">
                <DynamicNotches 
                  maxShots={maxShots} 
                  originalNotches={PHASE_FULL.notch}
                  currentShots={currentShots}
                />
              </G>
            </>
          )}

          {/* FASE FILLING: Vetro VUOTO + Liquido animato sopra + TACCHETTE dinamiche */}
          {phase === 'filling' && (
            <>
              <Defs>
                <ClipPath id="liquidClip">
                  <Rect 
                    x={0} 
                    y={clipY + liquidWaveOffset} 
                    width={VB_SMALL_WIDTH} 
                    height={VB_SMALL_HEIGHT} 
                  />
                </ClipPath>
              </Defs>

              {/* PRIMA: Liquido animato con clip (DIETRO al vetro) */}
              <G clipPath="url(#liquidClip)">
                <G transform={`translate(${liquidWaveOffset * 0.5}, 0)`}>
                  <PathGroup paths={PHASE_FILLING.liquid} />
                </G>
              </G>
              
              {/* Schiuma leggera animata (si accentuerà verso penultima sparata) */}
              <G transform={`translate(0, ${lightFoamOffset})`} opacity={0.3 + (fillPct * 0.4)}>
                <PathGroup paths={PHASE_FILLING.foam} />
              </G>
              
              {/* Vetro da PHASE_EMPTY (boccale vuoto, senza liquido statico) */}
              <PathGroup paths={PHASE_EMPTY.glass} />
              
              {/* TACCHETTE DINAMICHE - Scale from large viewBox to small viewBox coordinate space */}
              {/* Note: need to scale from 1696x2528 to 832x1248 (0.49 factor) */}
              <G transform="scale(0.49, 0.49) translate(0, 0)">
                <DynamicNotches 
                  maxShots={maxShots} 
                  originalNotches={PHASE_FULL.notch}
                  currentShots={currentShots}
                />
              </G>
            </>
          )}

          {/* FASE FULL: Vetro + liquido completo + schiuma animata */}
          {phase === 'full' && (
            <>
              {/* Glass back */}
              <PathGroup paths={phaseData.glass.slice(0, Math.floor(phaseData.glass.length / 2))} />
              
              {/* Notches */}
              {selectedNotches.length > 0 && <PathGroup paths={selectedNotches} />}
              
              {/* Liquid with wave animation */}
              <G transform={`translate(${liquidWaveOffset * 0.3}, ${liquidWaveOffset * 0.2})`}>
                <PathGroup paths={phaseData.liquid} />
              </G>
              
              {/* Glass front */}
              <PathGroup paths={phaseData.glass.slice(Math.floor(phaseData.glass.length / 2))} />
              
              {/* Foam with wave animation */}
              <G transform={`translate(0, ${foamWaveOffset})`}>
                <PathGroup paths={phaseData.foam} />
              </G>
            </>
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  mug: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { getMugPhase, getNotchCount, getLiquidFillPercentage };
