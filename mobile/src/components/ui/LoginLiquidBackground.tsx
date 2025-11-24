import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

type Props = { children?: React.ReactNode; height?: number; variant?: 'full' | 'footer' };

export default function LoginLiquidBackground({ children, height: hProp, variant = 'full' }: Props) {
  const { width, height } = Dimensions.get('window');
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (val: Animated.Value, duration: number, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration, delay, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration, useNativeDriver: true }),
        ])
      ).start();
    };
    loop(a1, 8000);
    loop(a2, 10000, 600);
    loop(a3, 12000, 1200);
  }, []);

  const tx = (val: Animated.Value, factor: number) => val.interpolate({ inputRange: [0, 1], outputRange: [-(width * factor), width * factor] });
  const ty = (val: Animated.Value, factor: number) => val.interpolate({ inputRange: [0, 1], outputRange: [-(height * factor), height * factor] });
  const sc = (val: Animated.Value, base: number) => val.interpolate({ inputRange: [0, 1], outputRange: [base, base * 1.06] });

  const isFooter = variant === 'footer';
  const blob1 = isFooter ? { width: 600, height: 600, top: -240, left: -180 } : { width: 900, height: 900, top: -420, left: -260 };
  const blob2 = isFooter ? { width: 540, height: 540, top: -180, left: -100 } : { width: 820, height: 820, top: -340, left: -140 };
  const blob3 = isFooter ? { width: 500, height: 500, top: -120, left: -40 } : { width: 760, height: 760, top: -260, left: -60 };

  return (
    <View style={isFooter ? { height: hProp ?? 220, width: '100%', overflow: 'hidden' } : styles.container}>
      <Animated.View style={[styles.blob, styles.blob1, blob1, { transform: [{ translateX: tx(a1, 0.12) }, { translateY: ty(a1, 0.02) }, { scale: sc(a1, 1.0) }] }]} />
      <Animated.View style={[styles.blob, styles.blob2, blob2, { transform: [{ translateX: tx(a2, 0.10) }, { translateY: ty(a2, 0.018) }, { scale: sc(a2, 0.98) }] }]} />
      <Animated.View style={[styles.blob, styles.blob3, blob3, { transform: [{ translateX: tx(a3, 0.08) }, { translateY: ty(a3, 0.015) }, { scale: sc(a3, 1.02) }] }]} />
      {!isFooter ? <View style={styles.overlay} /> : null}
      {!isFooter ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F9FF' },
  blob: { position: 'absolute', borderRadius: 800 },
  blob1: { backgroundColor: '#D9EEFF' },
  blob2: { backgroundColor: '#CDE8FF' },
  blob3: { backgroundColor: '#BFE2FF' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 300, backgroundColor: 'rgba(255,255,255,0.55)' },
  content: { flex: 1 },
});
