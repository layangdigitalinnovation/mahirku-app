import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

type Props = { children?: React.ReactNode };

export default function CloudBackground({ children }: Props) {
  const { width, height } = Dimensions.get('window');
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (val: Animated.Value, duration: number, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration, delay, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration, useNativeDriver: true }),
        ])
      ).start();
    };
    loop(wave1, 9000);
    loop(wave2, 11000, 800);
    loop(wave3, 13000, 1600);
  }, []);

  const tx1 = wave1.interpolate({ inputRange: [0, 1], outputRange: [-(width * 0.15), width * 0.15] });
  const tx2 = wave2.interpolate({ inputRange: [0, 1], outputRange: [width * 0.12, -(width * 0.12)] });
  const tx3 = wave3.interpolate({ inputRange: [0, 1], outputRange: [-(width * 0.08), width * 0.08] });
  const ty1 = wave1.interpolate({ inputRange: [0, 1], outputRange: [-(height * 0.01), height * 0.01] });
  const ty2 = wave2.interpolate({ inputRange: [0, 1], outputRange: [height * 0.015, -(height * 0.015)] });
  const ty3 = wave3.interpolate({ inputRange: [0, 1], outputRange: [-(height * 0.008), height * 0.008] });

  const waveWidth = width * 1.6;
  const waveHeight = 220;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.wave, styles.wave1, { width: waveWidth, height: waveHeight, transform: [{ translateX: tx1 }, { translateY: ty1 }] }]} />
      <Animated.View style={[styles.wave, styles.wave2, { width: waveWidth, height: waveHeight, transform: [{ translateX: tx2 }, { translateY: ty2 }] }]} />
      <Animated.View style={[styles.wave, styles.wave3, { width: waveWidth, height: waveHeight, transform: [{ translateX: tx3 }, { translateY: ty3 }] }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF6FF' },
  wave: { position: 'absolute', top: -40, left: -(Dimensions.get('window').width * 0.3), borderRadius: 100, opacity: 0.8 },
  wave1: { backgroundColor: '#D6ECFF' },
  wave2: { backgroundColor: '#C6E5FF', top: 20, opacity: 0.7 },
  wave3: { backgroundColor: '#B6DEFF', top: 60, opacity: 0.6 },
  content: { flex: 1 },
});

